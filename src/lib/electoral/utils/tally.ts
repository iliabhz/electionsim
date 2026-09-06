import type { TallyRow, WeightedBallot } from '../types';

export function firstPrefTallies(
  weighted: WeightedBallot[],
  active: Set<string>,
  order: string[],
): { rows: TallyRow[]; exhausted: number } {
  const map = new Map(order.map((id) => [id, 0]));
  let exhausted = 0;
  for (const { weight, ballot } of weighted) {
    if (ballot.type !== 'ranked') continue;
    const first = ballot.ranking.find((id) => active.has(id));
    if (first === undefined) {
      exhausted += weight;
    } else {
      map.set(first, (map.get(first) ?? 0) + weight);
    }
  }
  return {
    rows: order
      .filter((id) => active.has(id))
      .map((id) => ({ candidateId: id, value: map.get(id) ?? 0 })),
    exhausted,
  };
}

export function tallyPicks(
  weighted: WeightedBallot[],
  order: string[],
): TallyRow[] {
  const map = new Map(order.map((id) => [id, 0]));
  for (const { weight, ballot } of weighted) {
    if (ballot.type !== 'picks') continue;
    for (const id of ballot.picks) {
      if (map.has(id)) map.set(id, (map.get(id) ?? 0) + weight);
    }
  }
  return order.map((id) => ({ candidateId: id, value: map.get(id) ?? 0 }));
}

export function tallyCardinal(
  weighted: WeightedBallot[],
  order: string[],
): TallyRow[] {
  const map = new Map(order.map((id) => [id, 0]));
  for (const { weight, ballot } of weighted) {
    if (ballot.type !== 'cardinal') continue;
    for (const id of order) {
      const score = ballot.scores[id];
      if (typeof score === 'number') {
        map.set(id, (map.get(id) ?? 0) + weight * score);
      }
    }
  }
  return order.map((id) => ({ candidateId: id, value: map.get(id) ?? 0 }));
}

export const BORDA_TRUNCATION = 'min' as const;

export function tallyBorda(
  weighted: WeightedBallot[],
  order: string[],
): TallyRow[] {
  const n = order.length;
  const map = new Map(order.map((id) => [id, 0]));
  for (const { weight, ballot } of weighted) {
    if (ballot.type !== 'ranked') continue;
    for (let i = 0; i < ballot.ranking.length; i++) {
      const id = ballot.ranking[i];
      if (map.has(id)) map.set(id, (map.get(id) ?? 0) + weight * (n - i));
    }
    for (const id of order) {
      if (!ballot.ranking.includes(id)) {
        map.set(id, (map.get(id) ?? 0) + weight);
      }
    }
  }
  return order.map((id) => ({ candidateId: id, value: map.get(id) ?? 0 }));
}
