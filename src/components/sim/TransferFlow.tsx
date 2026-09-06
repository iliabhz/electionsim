'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MiniTallies from './MiniTallies';
import { NOTE_FA } from './RoundTimeline';
import type { Candidate, RoundInfo } from '@/lib/electoral';
import { formatFa, toFaDigits } from '@/lib/format/fa';

interface Props {
  rounds: RoundInfo[];
  candidates: Candidate[];
}

const EXHAUSTED_COLOR = '#9ca3af';

export default function TransferFlow({ rounds, candidates }: Props) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const clampedStep = Math.min(step, rounds.length - 1);
  const round = rounds[clampedStep];
  const byId = new Map(candidates.map((c) => [c.id, c]));

  useEffect(() => {
    if (!playing) return;
    if (clampedStep >= rounds.length - 1) {
      const t = setTimeout(() => setPlaying(false), 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1600);
    return () => clearTimeout(t);
  }, [playing, clampedStep, rounds.length]);

  if (!round) return null;

  const transfers = round.transfers ?? [];
  const maxWeight = Math.max(...transfers.map((t) => t.weight), 1);
  const recipients = transfers.map((t) => ({
    id: t.to,
    name: t.to ? (byId.get(t.to)?.name ?? t.to) : 'ته‌کشیده',
    color: t.to ? (byId.get(t.to)?.color ?? '#888') : EXHAUSTED_COLOR,
    weight: t.weight,
  }));
  const height = Math.max(recipients.length * 46 + 20, 110);
  const source = round.eliminated ? byId.get(round.eliminated) : undefined;
  const sy = height / 2;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
          انیمیشن حذف و انتقال رأی
        </h3>
        {round.seat !== undefined && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
            صندلی {toFaDigits(round.seat)}
          </span>
        )}
        {round.note && (
          <span className="text-xs text-neutral-500">
            {NOTE_FA[round.note] ?? round.note}
          </span>
        )}
      </div>

      {round.tallies && (
        <div className="mb-4">
          <MiniTallies
            rows={round.tallies}
            candidates={candidates}
            winnerIds={round.seatWinner ? [round.seatWinner] : []}
          />
        </div>
      )}

      {round.eliminated && recipients.length > 0 && source ? (
        <>
          <svg
            role="img"
            viewBox={`0 0 360 ${height}`}
            className="w-full"
            aria-label={`انتقال رأی پس از حذف ${source.name}: ${transfers
              .map(
                (t) =>
                  `${formatFa(t.weight)} رأی به ${
                    t.to ? (byId.get(t.to)?.name ?? t.to) : 'رأی‌های ته‌کشیده'
                  }`,
              )
              .join('، ')}`}
          >
            {recipients.map((r, i) => {
              const ty = 28 + i * 46;
              const d = `M 241 ${sy} C 205 ${sy}, 180 ${ty}, 140 ${ty}`;
              return (
                <motion.path
                  key={`${clampedStep}-${r.id ?? 'exhausted'}`}
                  d={d}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={3 + 9 * (r.weight / maxWeight)}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              );
            })}
            {recipients.map((r, i) => {
              const ty = 28 + i * 46;
              return (
                <g key={`node-${clampedStep}-${r.id ?? 'exhausted'}`}>
                  <circle cx={130} cy={ty} r={9} fill={r.color} />
                  <text
                    x={116}
                    y={ty + 4}
                    textAnchor="end"
                    fontSize={12}
                    className="fill-neutral-700 dark:fill-neutral-300"
                  >
                    {r.name}
                  </text>
                  <text
                    x={192}
                    y={(sy + ty) / 2 - 3}
                    textAnchor="middle"
                    fontSize={10}
                    className="fill-neutral-500"
                  >
                    {formatFa(r.weight)}
                  </text>
                </g>
              );
            })}
            <circle cx={250} cy={sy} r={9} fill={source.color ?? '#888'} />
            <text
              x={236}
              y={sy + 4}
              textAnchor="end"
              fontSize={12}
              fontWeight={700}
              className="fill-neutral-700 dark:fill-neutral-300"
            >
              حذف: {source.name}
            </text>
          </svg>

          <ul className="mt-3 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            {transfers.map((t) => (
              <li key={t.to ?? 'exhausted'}>
                <span className="font-bold">
                  {byId.get(t.from)?.name ?? t.from}
                </span>
                {' ← '}
                {t.to ? (byId.get(t.to)?.name ?? t.to) : 'رأی‌های ته‌کشیده'}
                {': '}
                {formatFa(t.weight)} رأی
              </li>
            ))}
          </ul>
        </>
      ) : round.eliminated ? (
        <p className="text-xs text-neutral-500">
          در این مرحله رأی قابل‌انتقالی وجود نبود.
        </p>
      ) : (
        <p className="text-xs text-neutral-500">
          این مرحله حذفی نداشت — نامزد برنده مشخص شد.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={clampedStep === 0}
          className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm hover:bg-neutral-200 disabled:opacity-30 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          مرحلهٔ قبل
        </button>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          aria-label={playing ? 'توقف پخش' : 'پخش خودکار مراحل'}
        >
          {playing ? '⏸ توقف' : '▶ پخش'}
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(rounds.length - 1, s + 1))}
          disabled={clampedStep >= rounds.length - 1}
          className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm hover:bg-neutral-200 disabled:opacity-30 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          مرحلهٔ بعد
        </button>
        <input
          type="range"
          min={0}
          max={rounds.length - 1}
          step={1}
          value={clampedStep}
          onChange={(e) => {
            setPlaying(false);
            setStep(Number(e.target.value));
          }}
          className="min-w-32 flex-1"
          aria-label="انتخاب مرحلهٔ شمارش"
        />
        <span className="text-xs text-neutral-500">
          مرحلهٔ {toFaDigits(clampedStep + 1)} از {toFaDigits(rounds.length)}
        </span>
      </div>
    </div>
  );
}
