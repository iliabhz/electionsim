'use client';

import type { TallyRow, Candidate } from '@/lib/electoral';
import { formatFa, percentFa } from '@/lib/format/fa';

interface Props {
  rows: TallyRow[];
  candidates: Candidate[];
  winnerIds: string[];
}

export default function MiniTallies({ rows, candidates, winnerIds }: Props) {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const total = rows.reduce((s, r) => s + r.value, 0);
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="space-y-1.5">
      {rows.map((row) => {
        const c = byId.get(row.candidateId);
        const isWinner = winnerIds.includes(row.candidateId);
        return (
          <div key={row.candidateId} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: c?.color }}
            />
            <span
              className={`w-16 shrink-0 truncate ${isWinner ? 'font-bold' : ''}`}
            >
              {c?.name}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(row.value / max) * 100}%`,
                  background: c?.color,
                  opacity: isWinner ? 1 : 0.4,
                }}
              />
            </div>
            <span
              className={`w-12 shrink-0 text-left ${isWinner ? 'font-bold' : 'text-neutral-500'}`}
            >
              {formatFa(row.value)}
            </span>
            <span className="w-10 shrink-0 text-left text-neutral-400">
              {percentFa(row.value, total)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
