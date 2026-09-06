'use client';

import { useMemo } from 'react';
import MiniTallies from './MiniTallies';
import SeatPodium from './SeatPodium';
import { compute, SYSTEMS } from '@/lib/electoral';
import type { ElectionResult, SystemId } from '@/lib/electoral';
import { formatFa, toFaDigits } from '@/lib/format/fa';
import {
  scopedInputFor,
  SYSTEM_ORDER,
  useSandbox,
} from '@/lib/store/sandbox';

interface SystemOutcome {
  systemId: SystemId;
  result: ElectionResult | null;
  error: string | null;
}

export default function CompareGrid() {
  const input = useSandbox((s) => s.input);

  const outcomes = useMemo<SystemOutcome[]>(() => {
    return SYSTEM_ORDER.map((systemId) => {
      try {
        return {
          systemId,
          result: compute(scopedInputFor(input, systemId)),
          error: null,
        };
      } catch (e) {
        return {
          systemId,
          result: null,
          error: e instanceof Error ? e.message : 'خطای ناشناخته',
        };
      }
    });
  }, [input]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        همهٔ نظام‌ها همان <strong>پروفایل ترجیحات</strong> شما را دریافت
        می‌کنند؛ برگه‌های رأی فقط به قالب مخصوص هر نظام تبدیل می‌شوند. برای
        نظام‌های چندبرنده، تعداد صندلیِ انتخاب‌شده اعمال می‌شود.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {outcomes.map(({ systemId, result, error }) => {
          const def = SYSTEMS[systemId];
          return (
            <div
              key={systemId}
              className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <h3 className="text-sm font-bold">{def.nameFa}</h3>
              {error || !result ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  خطا: {error}
                </p>
              ) : (
                <>
                  <SeatPodium
                    winners={result.winners}
                    candidates={input.candidates}
                    result={result}
                    seats={def.supportsMultiWinner ? input.seats : 1}
                    systemId={systemId}
                  />
                  {result.kind === 'tally' && (
                    <MiniTallies
                      rows={result.tallies}
                      candidates={input.candidates}
                      winnerIds={result.winners.map((w) => w.candidateId)}
                    />
                  )}
                  {result.kind === 'rounds' && (
                    <p className="text-xs text-neutral-500">
                      {toFaDigits(result.rounds.length)} مرحلهٔ شمارش
                      {result.exhaustedTotal > 0 &&
                        ` — ${formatFa(result.exhaustedTotal)} رأی ته‌کشیده`}
                    </p>
                  )}
                  {result.kind === 'pairwise' && result.winners.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      چرخهٔ کندورسه — برندهٔ دوبه‌دو وجود ندارد
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
