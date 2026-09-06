import { candidateOrder, expandBlocs, sortRows, topK } from '../utils/ballots';
import { tallyPicks } from '../utils/tally';
import type { ElectionInput, ElectionResult, TallyRow } from '../types';

export function plurality(input: ElectionInput): ElectionResult {
  const order = candidateOrder(input);
  const weighted = expandBlocs(input.blocs);
  let rows: TallyRow[];

  if (input.seats === 1) {
    const map = new Map(order.map((id) => [id, 0]));
    for (const { weight, ballot } of weighted) {
      if (ballot.type === 'ranked') {
        const first = ballot.ranking[0];
        if (first !== undefined && map.has(first)) {
          map.set(first, (map.get(first) ?? 0) + weight);
        }
      } else if (ballot.type === 'picks') {
        const p = ballot.picks[0];
        if (p !== undefined && map.has(p)) {
          map.set(p, (map.get(p) ?? 0) + weight);
        }
      }
    }
    rows = order.map((id) => ({ candidateId: id, value: map.get(id) ?? 0 }));
  } else {
    rows = tallyPicks(weighted, order);
  }

  const { winners, tieAtSeatBoundary } = topK(rows, input.seats, order);
  return {
    kind: 'tally',
    winners: winners.map((candidateId, i) => ({ candidateId, seat: i + 1 })),
    tallies: sortRows(rows, order),
    tieAtSeatBoundary,
  };
}
