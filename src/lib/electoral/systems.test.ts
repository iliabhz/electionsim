import { describe, expect, it } from 'vitest';
import { compute, SYSTEMS, validateInput } from './index';
import { EngineError } from './types';
import type {
  ElectionInput,
  PairwiseResult,
  RoundsResult,
  TallyResult,
  VoterBloc,
} from './types';

const CANDIDATES = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
];

function ranked(count: number, id: string, ranking: string[]): VoterBloc {
  return { id, label: id, count, ballot: { type: 'ranked', ranking } };
}

function base(overrides: Partial<ElectionInput>): ElectionInput {
  return {
    candidates: CANDIDATES,
    blocs: [ranked(1, 'v1', ['a', 'b', 'c'])],
    system: 'plurality',
    seats: 1,
    voterMode: 'blocs',
    ...overrides,
  };
}

describe('plurality', () => {
  it('shows the spoiler effect: B wins FPTP while A is the Condorcet winner', () => {
    const input = base({
      system: 'plurality',
      candidates: [...CANDIDATES, { id: 'd', name: 'D' }],
      blocs: [
        ranked(30, 'p1', ['a', 'b', 'c', 'd']),
        ranked(10, 'p2', ['d', 'b', 'c', 'a']),
        ranked(35, 'p3', ['b', 'a', 'c', 'd']),
        ranked(25, 'p4', ['c', 'a', 'b', 'd']),
      ],
    });
    const fp = compute(input);
    expect(fp.kind).toBe('tally');
    expect(fp.winners[0].candidateId).toBe('b');

    const cw = compute({ ...input, system: 'condorcet' });
    expect(cw.winners[0].candidateId).toBe('a');
  });

  it('multi-winner bloc plurality elects top-k from picks', () => {
    const input = base({
      system: 'plurality',
      seats: 2,
      candidates: [...CANDIDATES, { id: 'd', name: 'D' }],
      blocs: [
        {
          id: 'p1',
          label: 'p1',
          count: 40,
          ballot: { type: 'picks', picks: ['a', 'b'] },
        },
        {
          id: 'p2',
          label: 'p2',
          count: 30,
          ballot: { type: 'picks', picks: ['c'] },
        },
        {
          id: 'p3',
          label: 'p3',
          count: 30,
          ballot: { type: 'picks', picks: ['d'] },
        },
      ],
    });
    const result = compute(input);
    expect(result.winners.map((w) => w.candidateId)).toEqual(['a', 'b']);
  });
});

describe('runoff', () => {
  it('eliminates the moderate Condorcet winner (France 2002 pattern)', () => {
    const input = base({
      system: 'runoff',
      candidates: [
        { id: 'm', name: 'M' },
        { id: 'l', name: 'L' },
        { id: 'r', name: 'R' },
      ],
      blocs: [
        ranked(35, 'bl', ['l', 'm', 'r']),
        ranked(35, 'br', ['r', 'm', 'l']),
        ranked(30, 'bm', ['m', 'l', 'r']),
      ],
    });
    const result = compute(input) as RoundsResult;
    expect(result.kind).toBe('rounds');
    expect(result.winners[0].candidateId).toBe('l');
    expect(result.rounds?.[0].seatWinner).toBeUndefined();
    expect(result.rounds?.[0].qualified).toEqual(['l', 'r']);
    expect(result.rounds?.[1].seatWinner).toBe('l');

    const cw = compute({ ...input, system: 'condorcet' });
    expect(cw.winners[0].candidateId).toBe('m');
  });

  it('skips round two when a candidate wins a first-round majority', () => {
    const input = base({
      system: 'runoff',
      blocs: [
        ranked(55, 'p1', ['a', 'b', 'c']),
        ranked(25, 'p2', ['b', 'c', 'a']),
        ranked(20, 'p3', ['c', 'b', 'a']),
      ],
    });
    const result = compute(input) as RoundsResult;
    expect(result.rounds).toHaveLength(1);
    expect(result.rounds?.[0].note).toBe('majority_first_round');
    expect(result.winners[0].candidateId).toBe('a');
  });
});

describe('irv', () => {
  const paradoxInput = base({
    system: 'irv',
    blocs: [
      ranked(35, 'p1', ['a', 'c', 'b']),
      ranked(33, 'p2', ['b', 'c', 'a']),
      ranked(32, 'p3', ['c', 'b', 'a']),
    ],
  });

  it('elects B despite C being the Condorcet winner', () => {
    const result = compute(paradoxInput) as RoundsResult;
    expect(result.kind).toBe('rounds');
    expect(result.winners[0].candidateId).toBe('b');
    expect(result.rounds?.[0].eliminated).toBe('c');
    expect(result.rounds?.[0].transfers).toEqual([
      { from: 'c', to: 'b', weight: 32 },
    ]);
    expect(result.rounds?.[1].seatWinner).toBe('b');

    const cw = compute({ ...paradoxInput, system: 'condorcet' });
    expect(cw.winners[0].candidateId).toBe('c');
  });

  it('sequential multi-winner: seat 1 = B, seat 2 = C', () => {
    const result = compute({ ...paradoxInput, seats: 2 }) as RoundsResult;
    expect(result.winners.map((w) => w.candidateId)).toEqual(['b', 'c']);
    const seat2 = result.rounds?.filter((r) => r.seat === 2);
    expect(seat2?.length).toBeGreaterThan(0);
    expect(seat2?.at(-1)?.seatWinner).toBe('c');
  });

  it('handles exhausted ballots when the last seat has no rankable candidates left', () => {
    const input = base({
      system: 'irv',
      seats: 3,
      blocs: [
        ranked(50, 'p1', ['a', 'b']),
        ranked(30, 'p2', ['b']),
        ranked(20, 'p3', ['c', 'a']),
      ],
    });
    const result = compute(input) as RoundsResult;
    expect(result.winners.map((w) => w.candidateId)).toEqual(['a', 'b', 'c']);
    expect(result.exhaustedTotal).toBeGreaterThan(0);
  });
});

describe('condorcet', () => {
  it('detects a rock-paper-scissors cycle and the full Smith set', () => {
    const input = base({
      system: 'condorcet',
      blocs: [
        ranked(35, 'p1', ['a', 'b', 'c']),
        ranked(30, 'p2', ['b', 'c', 'a']),
        ranked(35, 'p3', ['c', 'a', 'b']),
      ],
    });
    const result = compute(input) as PairwiseResult;
    expect(result.kind).toBe('pairwise');
    expect(result.winners).toHaveLength(0);
    const cycle = result.cycle ?? [];
    const start = cycle.indexOf('a');
    expect([...cycle.slice(start), ...cycle.slice(0, start)]).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(result.smithSet).toEqual(['a', 'b', 'c']);
    expect(result.matrix).toEqual([
      [0, 70, 35],
      [30, 0, 65],
      [65, 35, 0],
    ]);
  });
});

describe('borda', () => {
  it('honest scores: A wins with 251 vs 249', () => {
    const input = base({
      system: 'borda',
      blocs: [ranked(51, 'p1', ['a', 'b', 'c']), ranked(49, 'p2', ['b', 'a', 'c'])],
    });
    const result = compute(input) as TallyResult;
    expect(result.winners[0].candidateId).toBe('a');
    const tallies = Object.fromEntries(
      result.tallies!.map((r) => [r.candidateId, r.value]),
    );
    expect(tallies).toEqual({ a: 251, b: 249, c: 100 });
  });

  it('burying flips the winner from A to B', () => {
    const input = base({
      system: 'borda',
      blocs: [ranked(51, 'p1', ['a', 'b', 'c']), ranked(49, 'p2', ['b', 'c', 'a'])],
    });
    const result = compute(input);
    expect(result.winners[0].candidateId).toBe('b');
  });
});

describe('cardinal (approval + score)', () => {
  it('bullet-voting approval collapses to the plurality winner', () => {
    const bullet = base({
      system: 'approval',
      blocs: [
        {
          id: 'p1',
          label: 'p1',
          count: 45,
          ballot: { type: 'cardinal', scores: { a: 1, b: 0, c: 0 } },
        },
        {
          id: 'p2',
          label: 'p2',
          count: 40,
          ballot: { type: 'cardinal', scores: { a: 0, b: 1, c: 0 } },
        },
        {
          id: 'p3',
          label: 'p3',
          count: 15,
          ballot: { type: 'cardinal', scores: { a: 0, b: 0, c: 1 } },
        },
      ],
    });
    expect(compute(bullet).winners[0].candidateId).toBe('a');
    const fp = compute({
      ...bullet,
      system: 'plurality',
      blocs: [
        { id: 'p1', label: 'p1', count: 45, ballot: { type: 'picks', picks: ['a'] } },
        { id: 'p2', label: 'p2', count: 40, ballot: { type: 'picks', picks: ['b'] } },
        { id: 'p3', label: 'p3', count: 15, ballot: { type: 'picks', picks: ['c'] } },
      ],
    });
    expect(fp.winners[0].candidateId).toBe('a');
  });

  it('honest approval differs: B wins with broad support', () => {
    const honest = base({
      system: 'approval',
      blocs: [
        {
          id: 'p1',
          label: 'p1',
          count: 45,
          ballot: { type: 'cardinal', scores: { a: 1, b: 1, c: 0 } },
        },
        {
          id: 'p2',
          label: 'p2',
          count: 40,
          ballot: { type: 'cardinal', scores: { a: 0, b: 1, c: 0 } },
        },
        {
          id: 'p3',
          label: 'p3',
          count: 15,
          ballot: { type: 'cardinal', scores: { a: 1, b: 0, c: 1 } },
        },
      ],
    });
    const result = compute(honest) as TallyResult;
    expect(result.winners[0].candidateId).toBe('b');
    const tallies = Object.fromEntries(
      result.tallies!.map((r) => [r.candidateId, r.value]),
    );
    expect(tallies).toEqual({ a: 60, b: 85, c: 15 });
  });

  it('score voting sums weighted scores', () => {
    const input = base({
      system: 'score',
      blocs: [
        {
          id: 'p1',
          label: 'p1',
          count: 2,
          ballot: { type: 'cardinal', scores: { a: 5, b: 3, c: 1 } },
        },
        {
          id: 'p2',
          label: 'p2',
          count: 1,
          ballot: { type: 'cardinal', scores: { a: 0, b: 5, c: 4 } },
        },
      ],
    });
    const result = compute(input) as TallyResult;
    const tallies = Object.fromEntries(
      result.tallies!.map((r) => [r.candidateId, r.value]),
    );
    expect(tallies).toEqual({ a: 10, b: 11, c: 6 });
    expect(result.winners[0].candidateId).toBe('b');
  });
});

describe('ties', () => {
  it('flags a 50/50 seat-boundary tie and breaks by candidate order', () => {
    const input = base({
      system: 'plurality',
      blocs: [ranked(50, 'p1', ['a']), ranked(50, 'p2', ['b'])],
    });
    const result = compute(input);
    expect(result.tieAtSeatBoundary).toBe(true);
    expect(result.winners[0].candidateId).toBe('a');
  });

  it('flags a tie at the last seat in multi-winner plurality', () => {
    const input = base({
      system: 'plurality',
      seats: 2,
      blocs: [
        ranked(40, 'p1', ['a']),
        ranked(30, 'p2', ['b']),
        ranked(30, 'p3', ['c']),
      ],
    });
    const result = compute(input);
    expect(result.winners.map((w) => w.candidateId)).toEqual(['a', 'b']);
    expect(result.tieAtSeatBoundary).toBe(true);
  });
});

describe('individual/bloc equivalence', () => {
  it('a count-3 bloc equals three count-1 blocs', () => {
    const bloc = base({
      system: 'irv',
      blocs: [ranked(3, 'p', ['a', 'b', 'c']), ranked(2, 'q', ['b', 'c', 'a'])],
    });
    const individuals = base({
      system: 'irv',
      voterMode: 'individual',
      blocs: [
        ranked(1, 'i1', ['a', 'b', 'c']),
        ranked(1, 'i2', ['a', 'b', 'c']),
        ranked(1, 'i3', ['a', 'b', 'c']),
        ranked(1, 'i4', ['b', 'c', 'a']),
        ranked(1, 'i5', ['b', 'c', 'a']),
      ],
    });
    expect(compute(bloc)).toEqual(compute(individuals));
  });
});

describe('validation', () => {
  it('rejects picks exceeding seats', () => {
    const input = base({
      system: 'plurality',
      seats: 1,
      blocs: [
        { id: 'p', label: 'p', count: 1, ballot: { type: 'picks', picks: ['a', 'b'] } },
      ],
    });
    expect(validateInput(input).length).toBeGreaterThan(0);
    expect(() => compute(input)).toThrow(EngineError);
  });

  it('rejects duplicate rankings and unknown candidates', () => {
    const dup = base({ blocs: [ranked(1, 'p', ['a', 'a', 'c'])] });
    expect(validateInput(dup).length).toBeGreaterThan(0);
    const unknown = base({ blocs: [ranked(1, 'p', ['a', 'zzz', 'c'])] });
    expect(validateInput(unknown).length).toBeGreaterThan(0);
  });

  it('rejects multi-winner runoff and non-binary approval scores', () => {
    const multiRunoff = base({ system: 'runoff', seats: 2 });
    expect(validateInput(multiRunoff).length).toBeGreaterThan(0);
    const badApproval = base({
      system: 'approval',
      blocs: [
        {
          id: 'p',
          label: 'p',
          count: 1,
          ballot: { type: 'cardinal', scores: { a: 2, b: 0, c: 1 } },
        },
      ],
    });
    expect(validateInput(badApproval).length).toBeGreaterThan(0);
  });

  it('rejects fewer than three candidates', () => {
    const input = base({
      candidates: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
    });
    expect(validateInput(input).length).toBeGreaterThan(0);
  });
});

describe('registry', () => {
  it('defines all seven systems with correct multi-winner capability', () => {
    expect(Object.keys(SYSTEMS)).toHaveLength(7);
    expect(SYSTEMS.plurality.supportsMultiWinner).toBe(true);
    expect(SYSTEMS.irv.supportsMultiWinner).toBe(true);
    expect(SYSTEMS.borda.supportsMultiWinner).toBe(true);
    expect(SYSTEMS.approval.supportsMultiWinner).toBe(true);
    expect(SYSTEMS.score.supportsMultiWinner).toBe(true);
    expect(SYSTEMS.runoff.supportsMultiWinner).toBe(false);
    expect(SYSTEMS.condorcet.supportsMultiWinner).toBe(false);
  });
});
