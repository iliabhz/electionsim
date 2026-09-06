import { describe, expect, it } from 'vitest';
import { compute } from '@/lib/electoral';
import type {
  ElectionResult,
  PairwiseResult,
  SystemId,
} from '@/lib/electoral';
import { defaultValues, LEARN_SCENARIOS } from './scenarios';

function computeFor(system: SystemId, overrides?: Record<string, number>) {
  const scenario = LEARN_SCENARIOS[system];
  const values = { ...defaultValues(scenario), ...overrides };
  return compute(scenario.build(values));
}

function winnerOf(result: ElectionResult): string | null {
  return result.winners[0]?.candidateId ?? null;
}

function condorcetWinnerOf(system: SystemId, overrides?: Record<string, number>): string | null {
  const scenario = LEARN_SCENARIOS[system];
  const values = { ...defaultValues(scenario), ...overrides };
  const r = compute({ ...scenario.build(values), system: 'condorcet', seats: 1 });
  return r.kind === 'pairwise' && r.winners.length > 0
    ? r.winners[0].candidateId
    : null;
}

describe('learn scenario: plurality', () => {
  it('base: plurality elects سبز while آبی wins head-to-head', () => {
    const r = computeFor('plurality');
    expect(winnerOf(r)).toBe('c2');
    expect(condorcetWinnerOf('plurality')).toBe('c1');
  });

  it('blue at 50 flips the FPTP winner', () => {
    expect(winnerOf(computeFor('plurality', { blue: 50 }))).toBe('c1');
  });

  it('orange growth never changes the FPTP winner on its own', () => {
    expect(winnerOf(computeFor('plurality', { orange: 35 }))).toBe('c2');
  });
});

describe('learn scenario: runoff', () => {
  it('base: moderate eliminated, آبی wins, نارنجی is the Condorcet winner', () => {
    const r = computeFor('runoff');
    expect(winnerOf(r)).toBe('c1');
    expect(condorcetWinnerOf('runoff')).toBe('c3');
  });

  it('moderate at 40 qualifies and wins the second round', () => {
    expect(winnerOf(computeFor('runoff', { moderate: 40 }))).toBe('c3');
  });

  it('moderate at 15 still gets eliminated', () => {
    expect(winnerOf(computeFor('runoff', { moderate: 15 }))).toBe('c1');
  });
});

describe('learn scenario: irv', () => {
  it('base: نارنجی eliminated first, سبز wins, نارنجی is Condorcet winner', () => {
    const r = computeFor('irv');
    expect(winnerOf(r)).toBe('c2');
    expect(condorcetWinnerOf('irv')).toBe('c3');
  });

  it('green weakened to 25: سبز eliminated first, نارنجی wins', () => {
    expect(winnerOf(computeFor('irv', { green: 25 }))).toBe('c3');
  });

  it('green at 45: نارنجی still eliminated, سبز wins', () => {
    expect(winnerOf(computeFor('irv', { green: 45 }))).toBe('c2');
  });
});

describe('learn scenario: condorcet', () => {
  it('base split=10 keeps the cycle: no winner', () => {
    const r = computeFor('condorcet') as PairwiseResult;
    expect(r.kind).toBe('pairwise');
    expect(r.winners).toHaveLength(0);
    expect(r.cycle).toBeDefined();
  });

  it('split=25 breaks the cycle: سبز becomes the Condorcet winner', () => {
    const r = computeFor('condorcet', { split: 25 });
    expect(winnerOf(r)).toBe('c2');
  });

  it('split=0 keeps the cycle too', () => {
    expect(computeFor('condorcet', { split: 0 }).winners).toHaveLength(0);
  });
});

describe('learn scenario: borda', () => {
  it('honest second bloc: آبی wins', () => {
    expect(winnerOf(computeFor('borda', { bury: 0 }))).toBe('c1');
  });

  it('burying: سبز wins with the same ballots', () => {
    expect(winnerOf(computeFor('borda', { bury: 1 }))).toBe('c2');
  });
});

describe('learn scenario: approval', () => {
  it('honest: سبز wins with broad support', () => {
    expect(winnerOf(computeFor('approval', { strategy: 0 }))).toBe('c2');
  });

  it('mixed: آبی wins', () => {
    expect(winnerOf(computeFor('approval', { strategy: 1 }))).toBe('c1');
  });

  it('all bullet: آبی wins like plurality', () => {
    expect(winnerOf(computeFor('approval', { strategy: 2 }))).toBe('c1');
  });
});

describe('learn scenario: score', () => {
  it('defaults: سبز wins on totals', () => {
    expect(winnerOf(computeFor('score'))).toBe('c2');
  });

  it('zeroing the green score flips to آبی', () => {
    expect(winnerOf(computeFor('score', { s2: 0 }))).toBe('c1');
  });
});
