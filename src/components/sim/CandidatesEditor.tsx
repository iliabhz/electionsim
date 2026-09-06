'use client';

import { toFaDigits } from '@/lib/format/fa';
import {
  MAX_CANDIDATES,
  MIN_CANDIDATES,
  useSandbox,
} from '@/lib/store/sandbox';

export default function CandidatesEditor() {
  const input = useSandbox((s) => s.input);
  const renameCandidate = useSandbox((s) => s.renameCandidate);
  const addCandidate = useSandbox((s) => s.addCandidate);
  const removeCandidate = useSandbox((s) => s.removeCandidate);

  return (
    <section aria-label="نامزدها" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">نامزدها</h2>
        <button
          type="button"
          onClick={addCandidate}
          disabled={input.candidates.length >= MAX_CANDIDATES}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + افزودن نامزد
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {input.candidates.map((c, i) => (
          <div
            key={c.id}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{ background: c.color }}
              aria-hidden
            />
            <input
              type="text"
              value={c.name}
              onChange={(e) => renameCandidate(c.id, e.target.value)}
              aria-label={`نام نامزد ${toFaDigits(i + 1)}`}
              className="w-24 bg-transparent text-sm font-medium"
            />
            <button
              type="button"
              aria-label={`حذف نامزد ${c.name}`}
              onClick={() => removeCandidate(c.id)}
              disabled={input.candidates.length <= MIN_CANDIDATES}
              className="rounded px-1 text-red-600 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-950"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {input.candidates.length <= MIN_CANDIDATES && (
        <p className="text-xs text-neutral-400">
          حداقل {toFaDigits(MIN_CANDIDATES)} نامزد لازم است.
        </p>
      )}
    </section>
  );
}
