'use client';

import BallotEditor from './BallotEditor';
import { formatFa, toFaDigits } from '@/lib/format/fa';
import {
  effectiveSeats,
  useSandbox,
} from '@/lib/store/sandbox';

const sliderToCount = (v: number) =>
  v >= 75 ? 1000 : Math.max(1, Math.round(10 ** (v / 25)));
const countToSlider = (c: number) =>
  Math.min(75, Math.round(Math.log10(Math.max(1, c)) * 25));

export default function BlocEditor() {
  const input = useSandbox((s) => s.input);
  const updateBloc = useSandbox((s) => s.updateBloc);
  const addBloc = useSandbox((s) => s.addBloc);
  const removeBloc = useSandbox((s) => s.removeBloc);

  const seats = effectiveSeats(input);
  const maxScore = input.options?.maxScore ?? 5;

  return (
    <section aria-label="ویرایشگر گروه‌های رأی‌دهنده" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">گروه‌های رأی‌دهنده</h2>
        <button
          type="button"
          onClick={addBloc}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + افزودن گروه
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {input.blocs.map((bloc) => (
          <div
            key={bloc.id}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-3 flex items-center gap-2">
              <input
                type="text"
                value={bloc.label}
                onChange={(e) =>
                  updateBloc(bloc.id, (b) => {
                    b.label = e.target.value;
                  })
                }
                aria-label="نام گروه"
                className="flex-1 rounded-lg border border-neutral-200 bg-transparent px-2 py-1 text-sm font-medium dark:border-neutral-700"
              />
              <button
                type="button"
                aria-label={`حذف گروه ${bloc.label}`}
                onClick={() => removeBloc(bloc.id)}
                className="rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                حذف
              </button>
            </div>
            <div className="mb-3 flex items-center gap-3">
              <label className="shrink-0 text-sm text-neutral-600 dark:text-neutral-400">
                تعداد:
              </label>
              <input
                type="range"
                min={0}
                max={75}
                step={1}
                value={countToSlider(bloc.count)}
                onChange={(e) =>
                  updateBloc(bloc.id, (b) => {
                    b.count = sliderToCount(Number(e.target.value));
                  })
                }
                className="flex-1"
                aria-label={`تعداد رأی‌دهندگان گروه ${bloc.label}`}
              />
              <span className="w-16 text-left text-sm font-bold text-blue-600">
                {formatFa(bloc.count)}
              </span>
            </div>
            <BallotEditor
              candidates={input.candidates}
              system={input.system}
              seats={seats}
              maxScore={maxScore}
              ballot={bloc.ballot}
              onChange={(ballot) =>
                updateBloc(bloc.id, (b) => {
                  b.ballot = ballot;
                })
              }
            />
            <p className="mt-2 text-xs text-neutral-400">
              شناسهٔ گروه: {toFaDigits(bloc.id.replace('b', ''))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
