import type {
  Ballot,
  BallotType,
  ElectionInput,
  SystemId,
  TallyRow,
  VoterBloc,
  WeightedBallot,
} from '../types';

export function expandBlocs(blocs: VoterBloc[]): WeightedBallot[] {
  return blocs
    .filter((b) => Number.isFinite(b.count) && b.count > 0)
    .map((b) => ({ weight: b.count, ballot: b.ballot }));
}

export function candidateOrder(input: ElectionInput): string[] {
  return input.candidates.map((c) => c.id);
}

export function ballotTypeFor(system: SystemId, seats: number): BallotType {
  if (system === 'approval' || system === 'score') return 'cardinal';
  if (system === 'plurality' && seats > 1) return 'picks';
  return 'ranked';
}

export function sortRows(rows: TallyRow[], order: string[]): TallyRow[] {
  const pos = new Map(order.map((id, i) => [id, i]));
  return [...rows].sort(
    (a, b) =>
      b.value - a.value ||
      (pos.get(a.candidateId) ?? 0) - (pos.get(b.candidateId) ?? 0),
  );
}

export function topK(
  rows: TallyRow[],
  k: number,
  order: string[],
): { winners: string[]; tieAtSeatBoundary: boolean } {
  const sorted = sortRows(rows, order);
  const winners = sorted.slice(0, k).map((r) => r.candidateId);
  const boundary =
    k > 0 && k < sorted.length && sorted[k - 1].value === sorted[k].value;
  return { winners, tieAtSeatBoundary: boundary };
}

export function totalWeight(weighted: WeightedBallot[]): number {
  return weighted.reduce((sum, wb) => sum + wb.weight, 0);
}

export function removeRankedCandidate(ballot: Ballot, id: string): Ballot {
  if (ballot.type !== 'ranked') return ballot;
  return { type: 'ranked', ranking: ballot.ranking.filter((c) => c !== id) };
}
