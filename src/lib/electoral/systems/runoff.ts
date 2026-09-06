import { candidateOrder, expandBlocs, sortRows } from '../utils/ballots';
import { firstPrefTallies } from '../utils/tally';
import type { ElectionInput, ElectionResult, RoundInfo } from '../types';

export function runoff(input: ElectionInput): ElectionResult {
  const order = candidateOrder(input);
  const weighted = expandBlocs(input.blocs);
  const active = new Set(order);

  const r1 = firstPrefTallies(weighted, active, order);
  const sorted1 = sortRows(r1.rows, order);
  const total = sorted1.reduce((s, r) => s + r.value, 0);
  const round1: RoundInfo = {
    index: 0,
    tallies: sorted1,
    exhausted: r1.exhausted,
  };

  if (sorted1[0].value * 2 > total) {
    round1.seatWinner = sorted1[0].candidateId;
    round1.note = 'majority_first_round';
    return {
      kind: 'rounds',
      winners: [{ candidateId: sorted1[0].candidateId, seat: 1 }],
      rounds: [round1],
      exhaustedTotal: 0,
    };
  }

  const qualified = sorted1.slice(0, 2).map((r) => r.candidateId);
  round1.qualified = qualified;
  const boundary =
    sorted1.length > 2 && sorted1[1].value === sorted1[2].value;

  const r2 = firstPrefTallies(weighted, new Set(qualified), order);
  const sorted2 = sortRows(r2.rows, order);
  const tie2 = sorted2[0].value === sorted2[1].value;
  const round2: RoundInfo = {
    index: 1,
    tallies: sorted2,
    exhausted: r2.exhausted,
    seatWinner: sorted2[0].candidateId,
    note: 'final_round',
  };

  return {
    kind: 'rounds',
    winners: [{ candidateId: sorted2[0].candidateId, seat: 1 }],
    rounds: [round1, round2],
    tieAtSeatBoundary: boundary || tie2,
    exhaustedTotal: r2.exhausted,
  };
}
