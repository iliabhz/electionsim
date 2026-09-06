'use client';

import type { Candidate, ElectionResult } from '@/lib/electoral';
import { formatFa, percentFa, toFaDigits } from '@/lib/format/fa';

interface Props {
  result: Extract<ElectionResult, { kind: 'rounds' }>;
  candidates: Candidate[];
}

export const NOTE_FA: Record<string, string> = {
  majority_first_round: 'اکثریت مطلق در مرحلهٔ اول — مرحلهٔ دوم برگزار نشد',
  final_round: 'مرحلهٔ نهایی',
  forced_winner: 'برندهٔ اجباری (هیچ‌کس اکثریت به‌دست نیاورد)',
  last_remaining: 'تنها نامزد باقی‌مانده',
};

export default function RoundTimeline({ result, candidates }: Props) {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  let lastSeat = 0;

  return (
    <ol className="space-y-3">
      {result.rounds?.map((round) => {
        const seatHeader =
          round.seat !== undefined && round.seat !== lastSeat
            ? `صندلی ${toFaDigits(round.seat)}`
            : null;
        if (round.seat !== undefined) lastSeat = round.seat;
        const activeTotal = round.tallies.reduce((s, r) => s + r.value, 0);
        const max = Math.max(...round.tallies.map((r) => r.value), 1);
        return (
          <li
            key={`${round.seat ?? 0}-${round.index}`}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h4 className="font-bold">مرحلهٔ {toFaDigits(round.index + 1)}</h4>
              {seatHeader && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                  {seatHeader}
                </span>
              )}
              {round.qualified && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/60 dark:text-green-300">
                  راه‌یافتگان: {round.qualified.map((id) => byId.get(id)?.name).join('، ')}
                </span>
              )}
              {round.eliminated && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/60 dark:text-red-300">
                  حذف: {byId.get(round.eliminated)?.name}
                </span>
              )}
              {round.seatWinner && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  🏆 {byId.get(round.seatWinner)?.name}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {round.tallies.map((row) => {
                const c = byId.get(row.candidateId);
                return (
                  <div key={row.candidateId} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: c?.color }}
                    />
                    <span className="w-24 shrink-0 truncate">{c?.name}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(row.value / max) * 100}%`,
                          background: c?.color,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <span className="w-14 text-left font-bold">
                      {formatFa(row.value)}
                    </span>
                    <span className="w-12 text-left text-xs text-neutral-400">
                      {percentFa(row.value, activeTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
              {round.exhausted !== undefined && round.exhausted > 0 && (
                <span>
                  رأی‌های ته‌کشیده: {formatFa(round.exhausted)}
                </span>
              )}
              {round.note && <span>{NOTE_FA[round.note] ?? round.note}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
