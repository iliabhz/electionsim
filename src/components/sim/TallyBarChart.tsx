'use client';

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { Candidate, TallyRow } from '@/lib/electoral';
import { formatFa } from '@/lib/format/fa';

interface Props {
  rows: TallyRow[];
  candidates: Candidate[];
  winnerIds: string[];
  title: string;
}

export default function TallyBarChart({
  rows,
  candidates,
  winnerIds,
  title,
}: Props) {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const data = rows.map((r) => {
    const c = byId.get(r.candidateId);
    return {
      name: c?.name ?? r.candidateId,
      value: r.value,
      fill: c?.color ?? '#888',
      winner: winnerIds.includes(r.candidateId),
    };
  });

  return (
    <div role="img" aria-label={`${title}: ${data.map((d) => `${d.name} ${formatFa(d.value)}`).join('، ')}`} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-3 text-sm font-bold text-neutral-600 dark:text-neutral-300">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={data.length * 44 + 30}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, bottom: 4, left: 8, right: 44 }}>
          <XAxis type="number" reversed hide />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            reversed
            tickLine={false}
            axisLine={false}
            style={{ fontSize: 13 }}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={22} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} opacity={d.winner ? 1 : 0.45} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: unknown) => formatFa(Number(v))}
              style={{ fontSize: 12, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
