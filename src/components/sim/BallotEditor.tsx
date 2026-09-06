'use client';

import type { Ballot, Candidate, SystemId } from '@/lib/electoral';
import { formatFa, toFaDigits } from '@/lib/format/fa';

interface Props {
  candidates: Candidate[];
  system: SystemId;
  seats: number;
  maxScore: number;
  ballot: Ballot;
  onChange: (ballot: Ballot) => void;
}

export default function BallotEditor({
  candidates,
  system,
  seats,
  maxScore,
  ballot,
  onChange,
}: Props) {
  if (ballot.type === 'ranked') {
    const move = (index: number, dir: -1 | 1) => {
      const ranking = [...ballot.ranking];
      const target = index + dir;
      if (target < 0 || target >= ranking.length) return;
      [ranking[index], ranking[target]] = [ranking[target], ranking[index]];
      onChange({ type: 'ranked', ranking });
    };
    const byId = new Map(candidates.map((c) => [c.id, c]));
    return (
      <div className="space-y-1">
        {ballot.ranking.map((id, i) => {
          const c = byId.get(id);
          if (!c) return null;
          return (
            <div
              key={id}
              className="flex items-center gap-2 rounded-lg bg-neutral-100 px-2 py-1 dark:bg-neutral-800"
            >
              <span className="w-6 text-center text-xs font-bold text-neutral-500">
                {toFaDigits(i + 1)}
              </span>
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: c.color }}
              />
              <span className="flex-1 text-sm">{c.name}</span>
              <button
                type="button"
                aria-label={`انتقال ${c.name} به رتبه بالاتر`}
                className="rounded px-1.5 text-sm hover:bg-neutral-200 disabled:opacity-30 dark:hover:bg-neutral-700"
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                ▲
              </button>
              <button
                type="button"
                aria-label={`انتقال ${c.name} به رتبه پایین‌تر`}
                className="rounded px-1.5 text-sm hover:bg-neutral-200 disabled:opacity-30 dark:hover:bg-neutral-700"
                onClick={() => move(i, 1)}
                disabled={i === ballot.ranking.length - 1}
              >
                ▼
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  if (ballot.type === 'picks') {
    const toggle = (id: string) => {
      const has = ballot.picks.includes(id);
      const picks = has
        ? ballot.picks.filter((p) => p !== id)
        : [...ballot.picks, id];
      if (picks.length > seats) return;
      onChange({ type: 'picks', picks });
    };
    return (
      <div className="space-y-1">
        <p className="text-xs text-neutral-500">
          حداکثر {toFaDigits(seats)} انتخاب — فعلاً {toFaDigits(ballot.picks.length)}
        </p>
        <div className="flex flex-wrap gap-2">
          {candidates.map((c) => {
            const checked = ballot.picks.includes(c.id);
            const disabled = !checked && ballot.picks.length >= seats;
            return (
              <label
                key={c.id}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
                  checked
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-neutral-300 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:hover:bg-neutral-800'
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(c.id)}
                />
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: c.color }}
                />
                {c.name}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  const approval = system === 'approval';
  const setScore = (id: string, value: number) => {
    onChange({
      type: 'cardinal',
      scores: { ...ballot.scores, [id]: value },
    });
  };
  return (
    <div className="space-y-2">
      {approval && (
        <p className="text-xs text-neutral-500">
          تأیید یا رد هر نامزد (رأی تأییدی)
        </p>
      )}
      {candidates.map((c) => {
        const value = ballot.scores[c.id] ?? 0;
        if (approval) {
          return (
            <label
              key={c.id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 text-sm transition-colors ${
                value === 1
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-neutral-300 dark:border-neutral-700'
              }`}
            >
              <input
                type="checkbox"
                className="accent-green-600"
                checked={value === 1}
                onChange={(e) => setScore(c.id, e.target.checked ? 1 : 0)}
              />
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: c.color }}
              />
              {c.name}
            </label>
          );
        }
        return (
          <div key={c.id} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: c.color }}
            />
            <span className="w-20 shrink-0 text-sm">{c.name}</span>
            <input
              type="range"
              min={0}
              max={maxScore}
              step={1}
              value={value}
              onChange={(e) => setScore(c.id, Number(e.target.value))}
              className="flex-1"
              aria-label={`امتیاز ${c.name}`}
            />
            <span className="w-8 text-center text-sm font-bold text-blue-600">
              {formatFa(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
