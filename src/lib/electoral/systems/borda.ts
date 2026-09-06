import { candidateOrder, expandBlocs, sortRows, topK } from '../utils/ballots';
import { tallyBorda } from '../utils/tally';
import type { ElectionInput, ElectionResult } from '../types';

export function borda(input: ElectionInput): ElectionResult {
  const order = candidateOrder(input);
  const rows = tallyBorda(expandBlocs(input.blocs), order);
  const { winners, tieAtSeatBoundary } = topK(rows, input.seats, order);
  return {
    kind: 'tally',
    winners: winners.map((candidateId, i) => ({ candidateId, seat: i + 1 })),
    tallies: sortRows(rows, order),
    tieAtSeatBoundary,
  };
}
