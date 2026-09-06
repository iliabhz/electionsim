'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PairwiseMatrix from '@/components/sim/PairwiseMatrix';
import RoundTimeline from '@/components/sim/RoundTimeline';
import SeatPodium from '@/components/sim/SeatPodium';
import TallyBarChart from '@/components/sim/TallyBarChart';
import { compute, EngineError, SYSTEMS } from '@/lib/electoral';
import type { SystemId } from '@/lib/electoral';
import { formatFa, toFaDigits } from '@/lib/format/fa';
import {
  defaultValues,
  LEARN_SCENARIOS,
} from '@/lib/learn/scenarios';
import { useSandbox } from '@/lib/store/sandbox';

export default function LearnSim({ system }: { system: SystemId }) {
  const router = useRouter();
  const scenario = LEARN_SCENARIOS[system];
  const def = SYSTEMS[system];
  const [values, setValues] = useState<Record<string, number>>(() =>
    defaultValues(scenario),
  );
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const { input, result, error } = useMemo(() => {
    const built = scenario.build(values);
    try {
      return {
        input: built,
        result: compute(built),
        error: null as string | null,
      };
    } catch (e) {
      return {
        input: built,
        result: null,
        error: e instanceof EngineError ? e.message : 'خطای ناشناخته',
      };
    }
  }, [scenario, values]);

  const insight = useMemo(
    () => (result && scenario.insight ? scenario.insight(input) : null),
    [scenario, input, result],
  );

  const setValue = (id: string, v: number) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    setActiveStep(null);
  };

  const applyStep = (index: number) => {
    const step = scenario.steps[index];
    if (!step) return;
    setValues((prev) => ({ ...prev, ...step.values }));
    setActiveStep(index);
  };

  const openInSandbox = () => {
    useSandbox.getState().loadInput(structuredClone(input));
    router.push('/sandbox');
  };

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
          {def.nameFa}
        </span>
        <span className="text-sm text-neutral-500">
          سناریوی ثابت آموزشی — فقط چند اهرم را جابه‌جا کنید
        </span>
      </div>

      {scenario.controls.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {scenario.controls.map((control) => (
            <div
              key={control.id}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950"
            >
              {control.kind === 'slider' ? (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label
                      htmlFor={`ctl-${system}-${control.id}`}
                      className="text-sm font-medium"
                    >
                      {control.labelFa}
                    </label>
                    <span className="min-w-10 rounded-lg bg-blue-600/10 px-2 py-0.5 text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatFa(values[control.id] ?? control.defaultValue)}
                    </span>
                  </div>
                  <input
                    id={`ctl-${system}-${control.id}`}
                    type="range"
                    min={control.min ?? 0}
                    max={control.max ?? 100}
                    step={control.step ?? 1}
                    value={values[control.id] ?? control.defaultValue}
                    onChange={(e) => setValue(control.id, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              ) : (
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">
                    {control.labelFa}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {(control.options ?? []).map((opt) => {
                      const active =
                        (values[control.id] ?? control.defaultValue) ===
                        opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setValue(control.id, opt.value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                            active
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {opt.labelFa}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            </div>
          ))}
        </div>
      )}

      {scenario.steps.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold">امتحان کن:</p>
          <ul className="space-y-2">
            {scenario.steps.map((step, i) => (
              <li key={step.labelFa}>
                <button
                  type="button"
                  onClick={() => applyStep(i)}
                  aria-expanded={activeStep === i}
                  className={`w-full rounded-xl border px-4 py-2.5 text-start text-sm transition-colors ${
                    activeStep === i
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60'
                      : 'border-neutral-200 bg-white hover:border-blue-400 dark:border-neutral-800 dark:bg-neutral-950'
                  }`}
                >
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {step.labelFa}
                  </span>
                  {activeStep === i && (
                    <span className="mt-1 block text-neutral-600 dark:text-neutral-400">
                      {step.noteFa}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error ? (
        <p className="rounded-xl border-2 border-red-400 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          خطا در محاسبه: {error}
        </p>
      ) : result ? (
        <>
          {insight && (
            <p className="rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium leading-7 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300">
              💡 {insight}
            </p>
          )}
          <div aria-live="polite">
            <SeatPodium
              winners={result.winners}
              candidates={input.candidates}
              result={result}
              seats={1}
              systemId={system}
            />
          </div>
          {result.kind === 'tally' && (
            <TallyBarChart
              rows={result.tallies}
              candidates={input.candidates}
              winnerIds={result.winners.map((w) => w.candidateId)}
              title="نتایج شمارش"
            />
          )}
          {result.kind === 'rounds' && (
            <RoundTimeline result={result} candidates={input.candidates} />
          )}
          {result.kind === 'pairwise' && (
            <PairwiseMatrix result={result} candidates={input.candidates} />
          )}
        </>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="text-xs text-neutral-500">
          برای ساخت سناریوی دلخواه (تا {toFaDigits(6)} نامزد، بلوک‌های نامحدود و
          همهٔ نظام‌ها):
        </p>
        <button
          type="button"
          onClick={openInSandbox}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700"
        >
          باز کردن در آزمایشگاه آزاد ←
        </button>
      </div>
    </div>
  );
}
