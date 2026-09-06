import { compute } from '@/lib/electoral';
import type { ElectionInput, SystemId, VoterBloc } from '@/lib/electoral';

const CANDIDATES = [
  { id: 'c1', name: 'آبی', color: '#2563eb' },
  { id: 'c2', name: 'سبز', color: '#16a34a' },
  { id: 'c3', name: 'نارنجی', color: '#ea580c' },
];

function nameOf(id: string): string {
  return CANDIDATES.find((c) => c.id === id)?.name ?? id;
}

function rankedBloc(
  id: string,
  label: string,
  count: number,
  ranking: string[],
): VoterBloc {
  return { id, label, count, ballot: { type: 'ranked', ranking } };
}

function cardinalBloc(
  id: string,
  label: string,
  count: number,
  scores: Record<string, number>,
): VoterBloc {
  return { id, label, count, ballot: { type: 'cardinal', scores } };
}

export interface LearnControl {
  id: string;
  labelFa: string;
  kind: 'slider' | 'switch';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number;
  options?: { labelFa: string; value: number }[];
  apply: (draft: ElectionInput, value: number) => void;
}

export interface LearnStep {
  labelFa: string;
  values: Record<string, number>;
  noteFa: string;
}

export interface LearnScenario {
  controls: LearnControl[];
  build: (values: Record<string, number>) => ElectionInput;
  steps: LearnStep[];
  insight?: (input: ElectionInput) => string | null;
}

export function defaultValues(scenario: LearnScenario): Record<string, number> {
  return Object.fromEntries(scenario.controls.map((c) => [c.id, c.defaultValue]));
}

function buildFrom(
  values: Record<string, number>,
  base: Pick<ElectionInput, 'candidates' | 'blocs'>,
  controls: LearnControl[],
  system: SystemId,
): ElectionInput {
  const draft: ElectionInput = {
    ...structuredClone(base),
    system,
    seats: 1,
    voterMode: 'blocs',
  };
  for (const c of controls) {
    c.apply(draft, values[c.id] ?? c.defaultValue);
  }
  return draft;
}

function condorcetWinnerId(input: ElectionInput): string | null {
  try {
    const r = compute({ ...input, system: 'condorcet', seats: 1 });
    return r.kind === 'pairwise' && r.winners.length > 0
      ? r.winners[0].candidateId
      : null;
  } catch {
    return null;
  }
}

function headToHeadInsightFa(systemVerb: string) {
  return (input: ElectionInput): string | null => {
    let myWinner: string | undefined;
    try {
      myWinner = compute(input).winners[0]?.candidateId;
    } catch {
      return null;
    }
    if (!myWinner) return null;
    const cw = condorcetWinnerId(input);
    if (!cw) return 'در این ترکیب حتی یک برندهٔ دوبه‌دو هم وجود ندارد!';
    if (cw !== myWinner) {
      return `نکته: در مقایسهٔ دوبه‌دو «${nameOf(cw)}» از همه بهتر است؛ اما ${systemVerb} «${nameOf(myWinner)}» را انتخاب کرد.`;
    }
    return `این‌بار برندهٔ دوبه‌دو و برندهٔ رسمی یکی است: «${nameOf(cw)}».`;
  };
}

function setBlocCount(draft: ElectionInput, blocId: string, count: number) {
  const bloc = draft.blocs.find((b) => b.id === blocId);
  if (bloc) bloc.count = count;
}

const pluralityScenario: LearnScenario = {
  controls: [
    {
      id: 'blue',
      labelFa: 'طرفداران آبی',
      kind: 'slider',
      min: 25,
      max: 50,
      step: 1,
      defaultValue: 40,
      apply: (d, v) => setBlocCount(d, 'b1', v),
    },
    {
      id: 'orange',
      labelFa: 'طرفداران نارنجی (حامی آبی)',
      kind: 'slider',
      min: 5,
      max: 35,
      step: 1,
      defaultValue: 24,
      apply: (d, v) => setBlocCount(d, 'b3', v),
    },
  ],
  build: (v) =>
    buildFrom(
      v,
      {
        candidates: CANDIDATES,
        blocs: [
          rankedBloc('b1', 'طرفداران آبی', 40, ['c1', 'c2', 'c3']),
          rankedBloc('b2', 'طرفداران سبز', 42, ['c2', 'c1', 'c3']),
          rankedBloc('b3', 'طرفداران نارنجی', 24, ['c3', 'c1', 'c2']),
        ],
      },
      pluralityScenario.controls,
      'plurality',
    ),
  steps: [
    {
      labelFa: 'نارنجی‌ها بیشتر شوند',
      values: { blue: 40, orange: 35 },
      noteFa:
        '۱۱ رأی به نارنجی اضافه شد، اما برندهٔ نسبی همان سبز ماند؛ رأی نارنجی‌ها عملاً دور ریخته شد.',
    },
    {
      labelFa: 'آبی پیشتاز شود',
      values: { blue: 50, orange: 24 },
      noteFa: 'حالا آبی از سبز جلو زد و برنده شد — با رأیِ کمتر از نصف!',
    },
  ],
  insight: headToHeadInsightFa('اکثریت نسبی'),
};

const runoffScenario: LearnScenario = {
  controls: [
    {
      id: 'moderate',
      labelFa: 'طرفداران نارنجی (میانه‌رو)',
      kind: 'slider',
      min: 15,
      max: 45,
      step: 1,
      defaultValue: 30,
      apply: (d, v) => setBlocCount(d, 'b3', v),
    },
  ],
  build: (v) =>
    buildFrom(
      v,
      {
        candidates: CANDIDATES,
        blocs: [
          rankedBloc('b1', 'طرفداران آبی', 35, ['c1', 'c3', 'c2']),
          rankedBloc('b2', 'طرفداران سبز', 34, ['c2', 'c3', 'c1']),
          rankedBloc('b3', 'طرفداران نارنجی', 30, ['c3', 'c1', 'c2']),
        ],
      },
      runoffScenario.controls,
      'runoff',
    ),
  steps: [
    {
      labelFa: 'میانه‌رو محبوب‌تر شود',
      values: { moderate: 40 },
      noteFa:
        'نارنجی به مرحلهٔ دوم رسید و این‌بار با رأی هر دو جناح پیروز شد.',
    },
    {
      labelFa: 'میانه‌رو ضعیف شود',
      values: { moderate: 15 },
      noteFa:
        'نارنجی زود حذف شد؛ در دور دوم آبی با رأی انتقالی نارنجی‌ها برنده شد.',
    },
  ],
  insight: headToHeadInsightFa('نظام دو مرحله‌ای'),
};

const irvScenario: LearnScenario = {
  controls: [
    {
      id: 'green',
      labelFa: 'طرفداران سبز',
      kind: 'slider',
      min: 20,
      max: 45,
      step: 1,
      defaultValue: 33,
      apply: (d, v) => setBlocCount(d, 'b2', v),
    },
  ],
  build: (v) =>
    buildFrom(
      v,
      {
        candidates: CANDIDATES,
        blocs: [
          rankedBloc('b1', 'طرفداران آبی', 35, ['c1', 'c3', 'c2']),
          rankedBloc('b2', 'طرفداران سبز', 33, ['c2', 'c3', 'c1']),
          rankedBloc('b3', 'طرفداران نارنجی', 32, ['c3', 'c2', 'c1']),
        ],
      },
      irvScenario.controls,
      'irv',
    ),
  steps: [
    {
      labelFa: 'سبز ضعیف‌تر شود',
      values: { green: 25 },
      noteFa:
        'حالا سبز اول حذف می‌شود و نارنجی — همان برندهٔ دوبه‌دو — سرانجام برنده می‌شود.',
    },
    {
      labelFa: 'سبز قوی‌تر شود',
      values: { green: 45 },
      noteFa:
        'سبز از نارنجی جلو زد؛ نارنجی حذف شد و رأی‌هایش سبز را پیروز کرد.',
    },
  ],
  insight: headToHeadInsightFa('IRV'),
};

const condorcetScenario: LearnScenario = {
  controls: [
    {
      id: 'split',
      labelFa: 'تعداد گروه سوم که سبز را بر آبی ترجیح می‌دهد',
      kind: 'slider',
      min: 0,
      max: 40,
      step: 5,
      defaultValue: 10,
      apply: (d, v) => {
        setBlocCount(d, 'b3a', v);
        setBlocCount(d, 'b3b', 40 - v);
      },
    },
  ],
  build: (v) =>
    buildFrom(
      v,
      {
        candidates: CANDIDATES,
        blocs: [
          rankedBloc('b1', 'گروه اول', 35, ['c1', 'c2', 'c3']),
          rankedBloc('b2', 'گروه دوم', 30, ['c2', 'c3', 'c1']),
          rankedBloc('b3a', 'گروه سوم (سبز-سرا)', 10, ['c3', 'c2', 'c1']),
          rankedBloc('b3b', 'گروه سوم (آبی-سرا)', 30, ['c3', 'c1', 'c2']),
        ],
      },
      condorcetScenario.controls,
      'condorcet',
    ),
  steps: [
    {
      labelFa: 'گروه سوم دست‌نخورده',
      values: { split: 0 },
      noteFa:
        'چرخهٔ کامل: آبی سبز را می‌برد، سبز نارنجی را، و نارنجی آبی را — برنده‌ای وجود ندارد!',
    },
    {
      labelFa: 'بخشی سبز را بر آبی ترجیح دهند',
      values: { split: 25 },
      noteFa: 'با همین جابه‌جایی کوچک، چرخه شکست و سبز برندهٔ دوبه‌دو شد.',
    },
  ],
  insight: (input) => {
    const cw = condorcetWinnerId(input);
    if (!cw) return 'چرخهٔ کامل: هیچ برندهٔ دوبه‌دویی وجود ندارد.';
    return `چرخه شکست و برندهٔ دوبه‌دو روشن شد: «${nameOf(cw)}».`;
  },
};

const bordaScenario: LearnScenario = {
  controls: [
    {
      id: 'bury',
      labelFa: 'رأی سبزی‌ها',
      kind: 'switch',
      defaultValue: 0,
      options: [
        { labelFa: 'صادق: سبز > آبی > نارنجی', value: 0 },
        { labelFa: 'تاکتکی: سبز > نارنجی > آبی', value: 1 },
      ],
      apply: (d, v) => {
        const b = d.blocs.find((x) => x.id === 'b2');
        if (b?.ballot.type === 'ranked') {
          b.ballot.ranking = v === 1 ? ['c2', 'c3', 'c1'] : ['c2', 'c1', 'c3'];
        }
      },
    },
  ],
  build: (v) =>
    buildFrom(
      v,
      {
        candidates: CANDIDATES,
        blocs: [
          rankedBloc('b1', 'طرفداران آبی', 51, ['c1', 'c2', 'c3']),
          rankedBloc('b2', 'طرفداران سبز', 49, ['c2', 'c1', 'c3']),
        ],
      },
      bordaScenario.controls,
      'borda',
    ),
  steps: [
    {
      labelFa: 'رأی صادق',
      values: { bury: 0 },
      noteFa: 'آبی با اختلاف کم برنده است.',
    },
    {
      labelFa: 'سبزی‌ها آبی را دفن کنند',
      values: { bury: 1 },
      noteFa: 'سبز برنده شد — بدون اینکه حتی یک رأی واقعی عوض شود.',
    },
  ],
  insight: (input) => {
    const b2 = input.blocs.find((b) => b.id === 'b2');
    if (b2?.ballot.type === 'ranked' && b2.ballot.ranking[1] === 'c3') {
      return 'دفن رقیب: سبز برنده شد فقط با پایین‌بردن رتبهٔ آبی در برگهٔ سبزی‌ها.';
    }
    return null;
  },
};

const APPROVAL_PATTERNS = [
  {
    b1: { c1: 1, c2: 1, c3: 0 },
    b2: { c1: 0, c2: 1, c3: 0 },
    b3: { c1: 1, c2: 0, c3: 1 },
  },
  {
    b1: { c1: 1, c2: 0, c3: 0 },
    b2: { c1: 0, c2: 1, c3: 0 },
    b3: { c1: 1, c2: 0, c3: 1 },
  },
  {
    b1: { c1: 1, c2: 0, c3: 0 },
    b2: { c1: 0, c2: 1, c3: 0 },
    b3: { c1: 0, c2: 0, c3: 1 },
  },
];

const approvalScenario: LearnScenario = {
  controls: [
    {
      id: 'strategy',
      labelFa: 'استراتژی رأی‌دهندگان',
      kind: 'switch',
      defaultValue: 0,
      options: [
        { labelFa: 'همه صادق', value: 0 },
        { labelFa: 'فقط آبی‌ها گلوله‌ای', value: 1 },
        { labelFa: 'همه گلوله‌ای', value: 2 },
      ],
      apply: (d, v) => {
        const pattern = APPROVAL_PATTERNS[v] ?? APPROVAL_PATTERNS[0];
        for (const [blocId, scores] of Object.entries(pattern)) {
          const bloc = d.blocs.find((b) => b.id === blocId);
          if (bloc?.ballot.type === 'cardinal') {
            bloc.ballot.scores = { ...scores };
          }
        }
      },
    },
  ],
  build: (v) =>
    buildFrom(
      v,
      {
        candidates: CANDIDATES,
        blocs: [
          cardinalBloc('b1', 'طرفداران آبی', 45, { c1: 1, c2: 1, c3: 0 }),
          cardinalBloc('b2', 'طرفداران سبز', 40, { c1: 0, c2: 1, c3: 0 }),
          cardinalBloc('b3', 'طرفداران نارنجی', 15, { c1: 1, c2: 0, c3: 1 }),
        ],
      },
      approvalScenario.controls,
      'approval',
    ),
  steps: [
    {
      labelFa: 'همه صادق',
      values: { strategy: 0 },
      noteFa: 'سبز با پشتوانهٔ گسترده برنده شد؛ گزینهٔ قابل‌قبول برای همه.',
    },
    {
      labelFa: 'همه گلوله‌ای',
      values: { strategy: 2 },
      noteFa: 'فقط نامزد اول مهم شد؛ رأی تأییدی تبدیل به اکثریت نسبی شد.',
    },
  ],
  insight: (input) => {
    const allBullet = input.blocs.every(
      (b) =>
        b.ballot.type === 'cardinal' &&
        Object.values(b.ballot.scores).filter((s) => s > 0).length <= 1,
    );
    return allBullet
      ? 'همه گلوله‌ای رأی دادند؛ رأی تأییدی حالا دقیقاً مثل اکثریت نسبی عمل می‌کند.'
      : null;
  },
};

const scoreScenario: LearnScenario = {
  controls: [
    {
      id: 's1',
      labelFa: 'امتیاز آبی‌ها به آبی',
      kind: 'slider',
      min: 0,
      max: 5,
      step: 1,
      defaultValue: 5,
      apply: (d, v) => {
        const b = d.blocs.find((x) => x.id === 'b1');
        if (b?.ballot.type === 'cardinal') b.ballot.scores.c1 = v;
      },
    },
    {
      id: 's2',
      labelFa: 'امتیاز آبی‌ها به سبز',
      kind: 'slider',
      min: 0,
      max: 5,
      step: 1,
      defaultValue: 3,
      apply: (d, v) => {
        const b = d.blocs.find((x) => x.id === 'b1');
        if (b?.ballot.type === 'cardinal') b.ballot.scores.c2 = v;
      },
    },
    {
      id: 's3',
      labelFa: 'امتیاز آبی‌ها به نارنجی',
      kind: 'slider',
      min: 0,
      max: 5,
      step: 1,
      defaultValue: 0,
      apply: (d, v) => {
        const b = d.blocs.find((x) => x.id === 'b1');
        if (b?.ballot.type === 'cardinal') b.ballot.scores.c3 = v;
      },
    },
  ],
  build: (v) =>
    buildFrom(
      v,
      {
        candidates: CANDIDATES,
        blocs: [
          cardinalBloc('b1', 'طرفداران آبی', 40, { c1: 5, c2: 3, c3: 0 }),
          cardinalBloc('b2', 'طرفداران سبز', 35, { c1: 0, c2: 5, c3: 1 }),
          cardinalBloc('b3', 'طرفداران نارنجی', 25, { c1: 2, c2: 1, c3: 5 }),
        ],
      },
      scoreScenario.controls,
      'score',
    ),
  steps: [
    {
      labelFa: 'آبی‌ها فقط عاشق آبی‌اند',
      values: { s1: 5, s2: 0, s3: 0 },
      noteFa: 'با صفر کردن امتیاز سبز، آبی برنده شد — شدت نظر تعیین‌کننده است.',
    },
  ],
};

export const LEARN_SCENARIOS: Record<SystemId, LearnScenario> = {
  plurality: pluralityScenario,
  runoff: runoffScenario,
  irv: irvScenario,
  condorcet: condorcetScenario,
  borda: bordaScenario,
  approval: approvalScenario,
  score: scoreScenario,
};
