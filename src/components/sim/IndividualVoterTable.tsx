'use client';

import BallotEditor from './BallotEditor';
import { toFaDigits } from '@/lib/format/fa';
import {
  effectiveSeats,
  MAX_INDIVIDUAL_VOTERS,
  useSandbox,
} from '@/lib/store/sandbox';

export default function IndividualVoterTable() {
  const input = useSandbox((s) => s.input);
  const updateBloc = useSandbox((s) => s.updateBloc);
  const addBloc = useSandbox((s) => s.addBloc);
  const removeBloc = useSandbox((s) => s.removeBloc);

  const seats = effectiveSeats(input);
  const maxScore = input.options?.maxScore ?? 5;
  const atCap = input.blocs.length >= MAX_INDIVIDUAL_VOTERS;

  return (
    <section aria-label="فهرست رأی‌دهندگان" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          رأی‌دهندگان ({toFaDigits(input.blocs.length)} از {toFaDigits(MAX_INDIVIDUAL_VOTERS)})
        </h2>
        <button
          type="button"
          onClick={addBloc}
          disabled={atCap}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + افزودن رأی‌دهنده
        </button>
      </div>
      {atCap && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          به سقف {toFaDigits(MAX_INDIVIDUAL_VOTERS)} رأی‌دهنده رسیده‌اید؛ برای تحلیل‌های
          بزرگ‌تر از حالت بلوکی استفاده کنید.
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {input.blocs.map((voter, i) => (
          <div
            key={voter.id}
            className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-500">
                رأی‌دهنده {toFaDigits(i + 1)}
              </span>
              <button
                type="button"
                aria-label={`حذف رأی‌دهنده ${toFaDigits(i + 1)}`}
                onClick={() => removeBloc(voter.id)}
                className="rounded-lg px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                حذف
              </button>
            </div>
            <BallotEditor
              candidates={input.candidates}
              system={input.system}
              seats={seats}
              maxScore={maxScore}
              ballot={voter.ballot}
              onChange={(ballot) =>
                updateBloc(voter.id, (b) => {
                  b.ballot = ballot;
                })
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}
