import { candidateOrder, expandBlocs, sortRows, topK } from '../utils/ballots';
import { tallyCardinal } from '../utils/tally';
import type { ElectionInput, ElectionResult } from '../types';

export function cardinal(input: ElectionInput): ElectionResult {
  const order = candidateOrder(input);
  const rows = tallyCardinal(expandBlocs(input.blocs), order);
  const { winners, tieAtSeatBoundary } = topK(rows, input.seats, order);
  return {
    kind: 'tally',
    winners: winners.map((candidateId, i) => ({ candidateId, seat: i + 1 })),
    tallies: sortRows(rows, order),
    tieAtSeatBoundary,
  };
}
