'use client';

import type { Candidate } from '@/lib/electoral';
import { toFaDigits } from '@/lib/format/fa';

interface Props {
  order: string[];
  matrix: number[][];
  cycle?: string[];
  candidates: Candidate[];
}

const CX = 120;
const CY = 120;
const R = 82;

export default function CycleGraph({
  order,
  matrix,
  cycle,
  candidates,
}: Props) {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const nameOf = (id: string) => byId.get(id)?.name ?? id;
  const colorOf = (id: string) => byId.get(id)?.color ?? '#888';
  const n = order.length;

  const pos = order.map((_, i) => {
    const angle = (-90 + (i * 360) / n) * (Math.PI / 180);
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const cycleEdges = new Set<string>();
  if (cycle && cycle.length > 1) {
    for (let i = 0; i < cycle.length; i++) {
      const a = cycle[i];
      const b = cycle[(i + 1) % cycle.length];
      cycleEdges.add(`${a}>${b}`);
    }
  }

  const winnerId =
    order.find((_, i) => order.every((_, j) => j === i || matrix[i][j] > matrix[j][i])) ??
    null;

  type Edge = { from: string; to: string; inCycle: boolean; fromWinner: boolean };
  const edges: Edge[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j || matrix[i][j] <= matrix[j][i]) continue;
      const from = order[i];
      const to = order[j];
      const inCycle = cycleEdges.has(`${from}>${to}`);
      const fromWinner = winnerId === from;
      if (cycle && cycle.length > 1) {
        if (inCycle) edges.push({ from, to, inCycle, fromWinner });
      } else if (fromWinner || winnerId === null) {
        edges.push({ from, to, inCycle, fromWinner });
      }
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-2 text-sm font-bold text-neutral-600 dark:text-neutral-300">
        نمودار برتری دوبه‌دو
      </h3>
      <svg
        role="img"
        viewBox="0 0 240 240"
        className="mx-auto w-full max-w-72"
        aria-label={`گراف مقایسه‌های دوبه‌دو: ${edges
          .map((e) => `${nameOf(e.from)} به ${nameOf(e.to)}`)
          .join('، ')}`}
      >
        <defs>
          <marker
            id="cycle-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
          </marker>
          <marker
            id="normal-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
          </marker>
        </defs>
        {edges.map((e) => {
          const i = order.indexOf(e.from);
          const j = order.indexOf(e.to);
          const pi = pos[i];
          const pj = pos[j];
          const dx = pj.x - pi.x;
          const dy = pj.y - pi.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const x1 = pi.x + ux * 14;
          const y1 = pi.y + uy * 14;
          const x2 = pj.x - ux * 16;
          const y2 = pj.y - uy * 16;
          const midX = (x1 + x2) / 2 - uy * 12;
          const midY = (y1 + y2) / 2 + ux * 12;
          const d = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
          const isCycle = e.inCycle;
          return (
            <path
              key={`${e.from}>${e.to}`}
              d={d}
              fill="none"
              stroke={isCycle ? '#dc2626' : '#9ca3af'}
              strokeWidth={isCycle ? 3 : 1.5}
              opacity={isCycle ? 0.95 : 0.55}
              markerEnd={isCycle ? 'url(#cycle-arrow)' : 'url(#normal-arrow)'}
            />
          );
        })}
        {order.map((id, i) => (
          <g key={id}>
            <circle
              cx={pos[i].x}
              cy={pos[i].y}
              r={13}
              fill={colorOf(id)}
              stroke={
                winnerId === id
                  ? '#16a34a'
                  : cycle && cycle.length > 1 && cycle.includes(id)
                    ? '#dc2626'
                    : 'transparent'
              }
              strokeWidth={3}
            />
            <text
              x={pos[i].x}
              y={pos[i].y + 30}
              textAnchor="middle"
              fontSize={11}
              className="fill-neutral-700 dark:fill-neutral-300"
            >
              {nameOf(id)}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-neutral-500">
        {cycle && cycle.length > 1
          ? `چرخهٔ کندورسه با ${toFaDigits(cycle.length)} نامزد — فلش قرمز یعنی «اکثریت این نامزد را به آن‌یک ترجیح داده‌اند»`
          : winnerId
            ? 'فلش‌ها برتری دوبه‌دوِ برندهٔ کندورسه (حلقهٔ سبز) را نشان می‌دهند'
            : 'فلش‌ها برتری دوبه‌دو را نشان می‌دهند'}
      </p>
    </div>
  );
}
