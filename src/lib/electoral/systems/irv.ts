import {
  candidateOrder,
  expandBlocs,
  removeRankedCandidate,
  sortRows,
} from '../utils/ballots';
import { firstPrefTallies } from '../utils/tally';
import type {
  ElectionInput,
  ElectionResult,
  RoundInfo,
  SeatResult,
  TransferEdge,
  WeightedBallot,
} from '../types';

interface IrvRun {
  winner: string;
  rounds: RoundInfo[];
  exhaustedFinal: number;
  tieAtSeatBoundary: boolean;
}

function computeTransfers(
  weighted: WeightedBallot[],
  eliminated: string,
  active: Set<string>,
): TransferEdge[] {
  const map = new Map<string, number>();
  let exhausted = 0;
  for (const { weight, ballot } of weighted) {
    if (ballot.type !== 'ranked') continue;
    const first = ballot.ranking.find((id) => active.has(id));
    if (first !== eliminated) continue;
    const next = ballot.ranking.find(
      (id) => id !== eliminated && active.has(id),
    );
    if (next) {
      map.set(next, (map.get(next) ?? 0) + weight);
    } else {
      exhausted += weight;
    }
  }
  const edges: TransferEdge[] = [...map.entries()].map(([to, weight]) => ({
    from: eliminated,
    to,
    weight,
  }));
  if (exhausted > 0) {
    edges.push({ from: eliminated, to: null, weight: exhausted });
  }
  return edges;
}

function runIrv(
  weighted: WeightedBallot[],
  order: string[],
  seat: number,
  startIndex: number,
): IrvRun {
  const active = new Set(order);
  const rounds: RoundInfo[] = [];
  let tie = false;
  let index = startIndex;

  while (active.size > 1) {
    const { rows, exhausted } = firstPrefTallies(weighted, active, order);
    const sorted = sortRows(rows, order);
    const activeTotal = sorted.reduce((s, r) => s + r.value, 0);
    const round: RoundInfo = { index, seat, tallies: sorted, exhausted };
    index += 1;

    if (sorted[0].value * 2 > activeTotal) {
      round.seatWinner = sorted[0].candidateId;
      rounds.push(round);
      return {
        winner: sorted[0].candidateId,
        rounds,
        exhaustedFinal: exhausted,
        tieAtSeatBoundary: tie,
      };
    }

    if (active.size === 2) {
      if (sorted[0].value === sorted[1].value) tie = true;
      round.seatWinner = sorted[0].candidateId;
      round.note = 'forced_winner';
      rounds.push(round);
      return {
        winner: sorted[0].candidateId,
        rounds,
        exhaustedFinal: exhausted,
        tieAtSeatBoundary: tie,
      };
    }

    const last = sorted[sorted.length - 1];
    if (sorted[sorted.length - 2].value === last.value) tie = true;
    round.eliminated = last.candidateId;
    round.transfers = computeTransfers(weighted, last.candidateId, active);
    rounds.push(round);
    active.delete(last.candidateId);
  }

  const remaining = [...active][0];
  const { rows, exhausted } = firstPrefTallies(weighted, active, order);
  rounds.push({
    index,
    seat,
    tallies: sortRows(rows, order),
    exhausted,
    seatWinner: remaining,
    note: 'last_remaining',
  });
  return {
    winner: remaining,
    rounds,
    exhaustedFinal: exhausted,
    tieAtSeatBoundary: tie,
  };
}

export function irv(input: ElectionInput): ElectionResult {
  const order = candidateOrder(input);
  let weighted = expandBlocs(input.blocs);
  const rounds: RoundInfo[] = [];
  const winners: SeatResult[] = [];
  let exhaustedTotal = 0;
  let tie = false;
  let index = 0;

  for (let seat = 1; seat <= input.seats; seat++) {
    const seated = new Set(winners.map((w) => w.candidateId));
    const remainingOrder = order.filter((id) => !seated.has(id));
    const run = runIrv(weighted, remainingOrder, seat, index);
    rounds.push(...run.rounds);
    index = run.rounds[run.rounds.length - 1].index + 1;
    winners.push({ candidateId: run.winner, seat });
    exhaustedTotal += run.exhaustedFinal;
    tie = tie || run.tieAtSeatBoundary;
    weighted = weighted.map(({ weight, ballot }) => ({
      weight,
      ballot: removeRankedCandidate(ballot, run.winner),
    }));
  }

  return {
    kind: 'rounds',
    winners,
    rounds,
    tieAtSeatBoundary: tie,
    exhaustedTotal,
  };
}
