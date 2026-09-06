'use client';

import { SYSTEMS } from '@/lib/electoral';
import type { Candidate, ElectionResult, SeatResult } from '@/lib/electoral';
import { toFaDigits } from '@/lib/format/fa';

interface Props {
  winners: SeatResult[];
  candidates: Candidate[];
  result: ElectionResult;
  seats: number;
  systemId: keyof typeof SYSTEMS;
}

export default function SeatPodium({
  winners,
  candidates,
  result,
  seats,
  systemId,
}: Props) {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const def = SYSTEMS[systemId];

  let headline: string;
  if (result.kind === 'pairwise' && winners.length === 0) {
    headline = 'برندهٔ کندورسه‌ای وجود ندارد — چرخهٔ ترجیحی!';
  } else if (winners.length === 1) {
    headline = `برنده: ${byId.get(winners[0].candidateId)?.name ?? '—'}`;
  } else {
    headline = `${toFaDigits(winners.length)} برنده از ${toFaDigits(seats)} صندلی`;
  }

  return (
    <div className="rounded-xl border-2 border-blue-500 bg-blue-50/60 p-4 shadow-sm dark:bg-blue-950/40">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        نتیجهٔ نظام «{def.nameFa}»
      </p>
      <h3 className="mt-1 text-xl font-extrabold">{headline}</h3>
      {winners.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {winners.map((w) => {
            const c = byId.get(w.candidateId);
            return (
              <span
                key={w.candidateId}
                className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold shadow dark:bg-neutral-900"
              >
                <span className="text-xs text-neutral-400">
                  صندلی {toFaDigits(w.seat)}
                </span>
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: c?.color }}
                />
                {c?.name}
              </span>
            );
          })}
        </div>
      )}
      {result.tieAtSeatBoundary && (
        <p className="mt-3 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
          ⚠️ تساوی در مرز صندلی — ترتیب نامزدها در فهرست به‌عنوان گزینش قطعی
          به‌کار رفته است.
        </p>
      )}
    </div>
  );
}
