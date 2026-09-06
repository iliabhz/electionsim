'use client';

import CycleGraph from './CycleGraph';
import type { Candidate, ElectionResult } from '@/lib/electoral';
import { formatFa, toFaDigits } from '@/lib/format/fa';

interface Props {
  result: Extract<ElectionResult, { kind: 'pairwise' }>;
  candidates: Candidate[];
}

export default function PairwiseMatrix({ result, candidates }: Props) {
  const order = result.order ?? candidates.map((c) => c.id);
  const matrix = result.matrix ?? [];
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const nameOf = (id: string) => byId.get(id)?.name ?? id;
  const colorOf = (id: string) => byId.get(id)?.color ?? '#888';

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-3 text-sm font-bold text-neutral-600 dark:text-neutral-300">
          ماتریس مقایسهٔ زوجی — هر خانه نشان می‌دهد چند رأی‌دهنده نامزدِ سطر را
          به نامزدِ ستون ترجیح داده‌اند
        </h3>
        <table className="w-full min-w-[420px] border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="p-1" aria-label="خالی" />
              {order.map((id) => (
                <th key={id} className="p-1 font-bold">
                  <span
                    className="me-1 inline-block h-2.5 w-2.5 rounded-full align-middle"
                    style={{ background: colorOf(id) }}
                  />
                  {nameOf(id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.map((rowId, i) => (
              <tr key={rowId}>
                <th className="p-1 text-start font-bold">
                  <span
                    className="me-1 inline-block h-2.5 w-2.5 rounded-full align-middle"
                    style={{ background: colorOf(rowId) }}
                  />
                  {nameOf(rowId)}
                </th>
                {order.map((colId, j) => {
                  if (i === j) {
                    return (
                      <td key={colId} className="p-1 text-neutral-300">
                        —
                      </td>
                    );
                  }
                  const wins = matrix[i][j] > matrix[j][i];
                  return (
                    <td
                      key={colId}
                      className={`p-1 font-bold ${
                        wins
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {formatFa(matrix[i][j])}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.cycle && result.cycle.length > 1 ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          ⚠️ پارادوکس کندورسه: هیچ نامزدی همهٔ رقبا را در مقایسهٔ دوبه‌دو
          شکست نمی‌دهد.
        </p>
      ) : null}
      <CycleGraph
        order={order}
        matrix={matrix}
        cycle={result.cycle}
        candidates={candidates}
      />
      {result.cycle && result.cycle.length > 1 && (
        <p className="text-sm">
          چرخه:{' '}
          {result.cycle.map((id) => nameOf(id)).join(' ← ')}{' '}
          ← {nameOf(result.cycle[0])}
        </p>
      )}
      {result.smithSet && result.smithSet.length > 1 && (
        <p className="text-sm text-neutral-500">
          مجموعهٔ اسمیت ({toFaDigits(result.smithSet.length)} عضو):{' '}
          {result.smithSet.map(nameOf).join('، ')}
        </p>
      )}
    </div>
  );
}
