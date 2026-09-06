import { candidateOrder, expandBlocs } from '../utils/ballots';
import type { ElectionInput, ElectionResult } from '../types';

export function condorcet(input: ElectionInput): ElectionResult {
  const order = candidateOrder(input);
  const n = order.length;
  const idx = new Map(order.map((id, i) => [id, i]));
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (const { weight, ballot } of expandBlocs(input.blocs)) {
    if (ballot.type !== 'ranked') continue;
    const ranks = ballot.ranking
      .map((id) => idx.get(id))
      .filter((i): i is number => i !== undefined);
    for (let a = 0; a < ranks.length; a++) {
      for (let b = a + 1; b < ranks.length; b++) {
        matrix[ranks[a]][ranks[b]] += weight;
      }
    }
  }

  const beats = (i: number, j: number) => matrix[i][j] > matrix[j][i];
  const adj: boolean[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => i !== j && beats(i, j)),
  );

  const winnerIdx = order.findIndex((_, i) =>
    order.every((_, j) => j === i || adj[i][j]),
  );

  if (winnerIdx !== -1) {
    return {
      kind: 'pairwise',
      winners: [{ candidateId: order[winnerIdx], seat: 1 }],
      matrix,
      order,
      smithSet: [order[winnerIdx]],
    };
  }

  const cycle = findCycle(adj, order);
  const smith = smithSet(adj, order);
  return {
    kind: 'pairwise',
    winners: [],
    matrix,
    order,
    cycle,
    smithSet: smith,
  };
}

function findCycle(adj: boolean[][], order: string[]): string[] | undefined {
  const n = order.length;
  const color = new Array(n).fill(0);
  const parent = new Array(n).fill(-1);
  let cycleIdx: number[] | undefined;

  function dfs(u: number) {
    color[u] = 1;
    for (let v = 0; v < n && !cycleIdx; v++) {
      if (!adj[u][v]) continue;
      if (color[v] === 0) {
        parent[v] = u;
        dfs(v);
      } else if (color[v] === 1) {
        const cyc = [v];
        let c = u;
        while (c !== v) {
          cyc.push(c);
          c = parent[c];
        }
        cyc.reverse();
        cycleIdx = cyc;
      }
    }
    color[u] = 2;
  }

  for (let i = 0; i < n && !cycleIdx; i++) {
    if (color[i] === 0) dfs(i);
  }
  return cycleIdx?.map((i) => order[i]);
}

function* combinations(n: number, size: number): Generator<number[]> {
  const current: number[] = [];
  function* start(from: number, left: number): Generator<number[]> {
    if (left === 0) {
      yield [...current];
      return;
    }
    for (let i = from; i <= n - left; i++) {
      current.push(i);
      yield* start(i + 1, left - 1);
      current.pop();
    }
  }
  yield* start(0, size);
}

function smithSet(adj: boolean[][], order: string[]): string[] {
  const n = order.length;
  for (let size = 1; size <= n; size++) {
    for (const subset of combinations(n, size)) {
      let ok = true;
      for (const i of subset) {
        for (let j = 0; j < n && ok; j++) {
          if (subset.includes(j)) continue;
          if (!adj[i][j]) ok = false;
        }
        if (!ok) break;
      }
      if (ok) return subset.map((i) => order[i]);
    }
  }
  return [...order];
}
