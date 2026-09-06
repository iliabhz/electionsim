'use client';

import { SYSTEMS } from '@/lib/electoral';
import type { SystemId } from '@/lib/electoral';
import { toFaDigits } from '@/lib/format/fa';
import { encodeScenario } from '@/lib/share';
import { SYSTEM_ORDER, useSandbox } from '@/lib/store/sandbox';

export default function ModeBar() {
  const input = useSandbox((s) => s.input);
  const setSystem = useSandbox((s) => s.setSystem);
  const setSeats = useSandbox((s) => s.setSeats);
  const setVoterMode = useSandbox((s) => s.setVoterMode);
  const undo = useSandbox((s) => s.undo);
  const redo = useSandbox((s) => s.redo);
  const canUndo = useSandbox((s) => s.past.length > 0);
  const canRedo = useSandbox((s) => s.future.length > 0);
  const notice = useSandbox((s) => s.notice);
  const setNotice = useSandbox((s) => s.setNotice);

  const onShare = async () => {
    const code = await encodeScenario(input);
    const url = `${window.location.origin}${window.location.pathname}?s=${code}`;
    window.history.replaceState(null, '', `?s=${code}`);
    try {
      await navigator.clipboard.writeText(url);
      setNotice('🔗 لینک سناریو در کلیپ‌بورد کپی شد.');
    } catch {
      setNotice('🔗 لینک سناریو در نوار آدرس همین صفحه به‌روزرسانی شد.');
    }
  };

  const def = SYSTEMS[input.system];
  const multiAvailable = def.supportsMultiWinner;

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">نظام رأی‌گیری:</span>
          <select
            value={input.system}
            onChange={(e) => setSystem(e.target.value as SystemId)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            {SYSTEM_ORDER.map((id) => (
              <option key={id} value={id}>
                {SYSTEMS[id].nameFa}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            تعداد صندلی{multiAvailable ? '' : ' (تک‌برنده)'}:
          </span>
          <div className="flex gap-1" role="group" aria-label="تعداد صندلی">
            {[1, 2, 3, 4, 5].map((n) => {
              const disabled = !multiAvailable && n > 1;
              return (
                <button
                  key={n}
                  type="button"
                  title={
                    disabled
                      ? `${def.nameFa} نسخه چندبرنده رایجی ندارد`
                      : undefined
                  }
                  disabled={disabled}
                  aria-pressed={input.seats === n}
                  onClick={() => setSeats(n)}
                  className={`h-8 w-8 rounded-lg text-sm font-bold transition-colors ${
                    input.seats === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                  }`}
                >
                  {toFaDigits(n)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="me-1 text-sm font-medium">حالت ورود رأی:</span>
          <button
            type="button"
            aria-pressed={input.voterMode === 'blocs'}
            onClick={() => setVoterMode('blocs')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              input.voterMode === 'blocs'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700'
            }`}
          >
            بلوک‌ها
          </button>
          <button
            type="button"
            aria-pressed={input.voterMode === 'individual'}
            onClick={() => setVoterMode('individual')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              input.voterMode === 'individual'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700'
            }`}
          >
            رأی‌دهندگان مجزا
          </button>
        </div>

        <div className="ms-auto flex gap-1">
          <button
            type="button"
            onClick={onShare}
            aria-label="کپی لینک اشتراک سناریو"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            🔗 اشتراک لینک
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label="واگرد"
            className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm hover:bg-neutral-200 disabled:opacity-30 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            ↶ واگرد
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            aria-label="ازنو"
            className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm hover:bg-neutral-200 disabled:opacity-30 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            ↷ ازنو
          </button>
        </div>
      </div>

      {notice && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {notice}
        </p>
      )}
      {!multiAvailable && (
        <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          «{def.nameFa}» نسخهٔ چندبرندهٔ رایج و پایداری ندارد؛ نتایج برای
          تک‌صندلی محاسبه می‌شود. برای نسخهٔ بلوکی از نظام‌های دیگر استفاده
          کنید.
        </p>
      )}
    </div>
  );
}
