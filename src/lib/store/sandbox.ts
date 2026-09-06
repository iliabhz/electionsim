import { useMemo } from 'react';
import { create } from 'zustand';
import {
  ballotTypeFor,
  compute,
  EngineError,
  SYSTEMS,
} from '@/lib/electoral';
import type {
  Ballot,
  BallotType,
  Candidate,
  ElectionInput,
  ElectionResult,
  SystemId,
  VoterBloc,
} from '@/lib/electoral';

export const MAX_CANDIDATES = 6;
export const MIN_CANDIDATES = 3;
export const MAX_INDIVIDUAL_VOTERS = 50;
export const MAX_SCORE = 5;

export const PALETTE = [
  '#2563eb',
  '#16a34a',
  '#ea580c',
  '#9333ea',
  '#dc2626',
  '#0891b2',
];

const NAMES_FA = [
  'آبی',
  'سبز',
  'نارنجی',
  'بنفش',
  'قرمز',
  'فیروزه‌ای',
];

export function makeCandidates(count: number): Candidate[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `c${i + 1}`,
    name: NAMES_FA[i] ?? `نامزد ${i + 1}`,
    color: PALETTE[i % PALETTE.length],
  }));
}

function defaultInput(system: SystemId): ElectionInput {
  const candidates = makeCandidates(3);
  const order = candidates.map((c) => c.id);
  return {
    candidates,
    blocs: [
      {
        id: 'b1',
        label: 'طرفداران آبی',
        count: 40,
        ballot: { type: 'ranked', ranking: order },
      },
      {
        id: 'b2',
        label: 'طرفداران سبز',
        count: 35,
        ballot: { type: 'ranked', ranking: [order[1], order[2], order[0]] },
      },
      {
        id: 'b3',
        label: 'طرفداران نارنجی',
        count: 25,
        ballot: { type: 'ranked', ranking: [order[2], order[0], order[1]] },
      },
    ],
    system,
    seats: 1,
    voterMode: 'blocs',
  };
}

export type PresetId =
  | 'default'
  | 'spoiler'
  | 'irv-paradox'
  | 'france-runoff'
  | 'condorcet-cycle'
  | 'borda-burying'
  | 'approval-bullet'
  | 'majority-sweep';

export const SYSTEM_ORDER: SystemId[] = [
  'plurality',
  'runoff',
  'irv',
  'condorcet',
  'borda',
  'approval',
  'score',
];

export const PRESETS: Record<
  PresetId,
  { titleFa: string; build: () => ElectionInput }
> = {
  default: {
    titleFa: 'سناریوی ساده (۳ نامزد)',
    build: () => defaultInput('plurality'),
  },
  spoiler: {
    titleFa: 'اثر شکافنده (FPTP)',
    build: () => {
      const candidates = makeCandidates(4);
      const [c1, c2, c3, c4] = candidates.map((c) => c.id);
      return {
        candidates,
        blocs: [
          {
            id: 'b1',
            label: 'پایگاه آبی',
            count: 30,
            ballot: { type: 'ranked', ranking: [c1, c2, c3, c4] },
          },
          {
            id: 'b2',
            label: 'پیروان بنفش (نامزد مشابه آبی)',
            count: 10,
            ballot: { type: 'ranked', ranking: [c4, c2, c3, c1] },
          },
          {
            id: 'b3',
            label: 'طرفداران سبز',
            count: 35,
            ballot: { type: 'ranked', ranking: [c2, c1, c3, c4] },
          },
          {
            id: 'b4',
            label: 'طرفداران نارنجی',
            count: 25,
            ballot: { type: 'ranked', ranking: [c3, c1, c2, c4] },
          },
        ],
        system: 'plurality',
        seats: 1,
        voterMode: 'blocs',
      };
    },
  },
  'irv-paradox': {
    titleFa: 'پارادوکس IRV (حذف برنده کندورسه)',
    build: () => {
      const candidates = makeCandidates(3);
      const [c1, c2, c3] = candidates.map((c) => c.id);
      return {
        candidates,
        blocs: [
          {
            id: 'b1',
            label: 'طرفداران آبی',
            count: 35,
            ballot: { type: 'ranked', ranking: [c1, c3, c2] },
          },
          {
            id: 'b2',
            label: 'طرفداران سبز',
            count: 33,
            ballot: { type: 'ranked', ranking: [c2, c3, c1] },
          },
          {
            id: 'b3',
            label: 'طرفداران نارنجی',
            count: 32,
            ballot: { type: 'ranked', ranking: [c3, c2, c1] },
          },
        ],
        system: 'irv',
        seats: 1,
        voterMode: 'blocs',
      };
    },
  },
  'france-runoff': {
    titleFa: 'الگوی فرانسه ۲۰۰۲ (حذف میانه‌رو)',
    build: () => {
      const candidates = makeCandidates(3);
      const [c1, c2, c3] = candidates.map((c) => c.id);
      return {
        candidates,
        blocs: [
          {
            id: 'b1',
            label: 'طرفداران آبی',
            count: 35,
            ballot: { type: 'ranked', ranking: [c1, c3, c2] },
          },
          {
            id: 'b2',
            label: 'طرفداران سبز',
            count: 35,
            ballot: { type: 'ranked', ranking: [c2, c3, c1] },
          },
          {
            id: 'b3',
            label: 'طرفداران نارنجی (میانه‌رو)',
            count: 30,
            ballot: { type: 'ranked', ranking: [c3, c1, c2] },
          },
        ],
        system: 'runoff',
        seats: 1,
        voterMode: 'blocs',
      };
    },
  },
  'condorcet-cycle': {
    titleFa: 'پارادوکس کندورسه (چرخهٔ سنگ‌کاغذقیچی)',
    build: () => {
      const candidates = makeCandidates(3);
      const [c1, c2, c3] = candidates.map((c) => c.id);
      return {
        candidates,
        blocs: [
          {
            id: 'b1',
            label: 'گروه اول',
            count: 35,
            ballot: { type: 'ranked', ranking: [c1, c2, c3] },
          },
          {
            id: 'b2',
            label: 'گروه دوم',
            count: 30,
            ballot: { type: 'ranked', ranking: [c2, c3, c1] },
          },
          {
            id: 'b3',
            label: 'گروه سوم',
            count: 35,
            ballot: { type: 'ranked', ranking: [c3, c1, c2] },
          },
        ],
        system: 'condorcet',
        seats: 1,
        voterMode: 'blocs',
      };
    },
  },
  'borda-burying': {
    titleFa: 'بوردا: دفن رقیب (رأی استراتژیک)',
    build: () => {
      const candidates = makeCandidates(3);
      const [c1, c2, c3] = candidates.map((c) => c.id);
      return {
        candidates,
        blocs: [
          {
            id: 'b1',
            label: 'طرفداران صادق آبی',
            count: 51,
            ballot: { type: 'ranked', ranking: [c1, c2, c3] },
          },
          {
            id: 'b2',
            label: 'طرفداران سبز (سبز > نارنجی > آبی)',
            count: 49,
            ballot: { type: 'ranked', ranking: [c2, c3, c1] },
          },
        ],
        system: 'borda',
        seats: 1,
        voterMode: 'blocs',
      };
    },
  },
  'approval-bullet': {
    titleFa: 'رأی تأییدی: رأی گلوله‌ای',
    build: () => {
      const candidates = makeCandidates(3);
      const [c1, c2, c3] = candidates.map((c) => c.id);
      return {
        candidates,
        blocs: [
          {
            id: 'b1',
            label: 'فقط آبی (رأی گلوله‌ای)',
            count: 45,
            ballot: {
              type: 'cardinal',
              scores: { [c1]: 1, [c2]: 0, [c3]: 0 },
            },
          },
          {
            id: 'b2',
            label: 'فقط سبز (رأی گلوله‌ای)',
            count: 40,
            ballot: {
              type: 'cardinal',
              scores: { [c1]: 0, [c2]: 1, [c3]: 0 },
            },
          },
          {
            id: 'b3',
            label: 'فقط نارنجی (رأی گلوله‌ای)',
            count: 15,
            ballot: {
              type: 'cardinal',
              scores: { [c1]: 0, [c2]: 0, [c3]: 1 },
            },
          },
        ],
        system: 'approval',
        seats: 1,
        voterMode: 'blocs',
      };
    },
  },
  'majority-sweep': {
    titleFa: 'جاروی همهٔ صندلی‌ها با ۵۱٪ (بلوک plurality)',
    build: () => ({
      candidates: [
        { id: 'a1', name: 'آبی ۱', color: '#2563eb' },
        { id: 'a2', name: 'آبی ۲', color: '#3b82f6' },
        { id: 'a3', name: 'آبی ۳', color: '#60a5fa' },
        { id: 'b1', name: 'سبز ۱', color: '#16a34a' },
        { id: 'b2', name: 'سبز ۲', color: '#22c55e' },
        { id: 'b3', name: 'سبز ۳', color: '#4ade80' },
      ],
      blocs: [
        {
          id: 'b1',
          label: 'حزب آبی (۵۱٪ — رأی حزبی)',
          count: 51,
          ballot: { type: 'picks', picks: ['a1', 'a2', 'a3'] },
        },
        {
          id: 'b2',
          label: 'طرفداران سبز ۱',
          count: 25,
          ballot: { type: 'picks', picks: ['b1', 'b2'] },
        },
        {
          id: 'b3',
          label: 'طرفداران سبز ۲',
          count: 24,
          ballot: { type: 'picks', picks: ['b1', 'b3'] },
        },
      ],
      system: 'plurality',
      seats: 3,
      voterMode: 'blocs',
    }),
  },
};

export function effectiveSeats(input: ElectionInput): number {
  return SYSTEMS[input.system].supportsMultiWinner ? input.seats : 1;
}

function normalizeBallot(
  ballot: Ballot,
  order: string[],
  seats: number,
  maxScore: number,
): Ballot {
  if (ballot.type === 'picks') {
    return {
      type: 'picks',
      picks: ballot.picks
        .filter((id) => order.includes(id))
        .slice(0, seats),
    };
  }
  if (ballot.type === 'cardinal') {
    const scores: Record<string, number> = {};
    for (const id of order) {
      scores[id] = Math.min(Math.max(ballot.scores[id] ?? 0, 0), maxScore);
    }
    return { type: 'cardinal', scores };
  }
  return { type: 'ranked', ranking: ballot.ranking.filter((id) => order.includes(id)) };
}

function convertBallot(
  ballot: Ballot,
  to: BallotType,
  order: string[],
  seats: number,
  maxScore: number,
): Ballot {
  if (ballot.type === to) return normalizeBallot(ballot, order, seats, maxScore);

  const preference = (() => {
    if (ballot.type === 'ranked') return ballot.ranking;
    if (ballot.type === 'picks') return ballot.picks;
    return [...order].sort(
      (x, y) =>
        (ballot.scores[y] ?? 0) - (ballot.scores[x] ?? 0) ||
        order.indexOf(x) - order.indexOf(y),
    );
  })();

  if (to === 'ranked') {
    const rest = order.filter((id) => !preference.includes(id));
    return { type: 'ranked', ranking: [...preference, ...rest] };
  }
  if (to === 'picks') {
    return { type: 'picks', picks: preference.slice(0, seats) };
  }
  const scores: Record<string, number> = {};
  if (ballot.type === 'cardinal') {
    for (const id of order) {
      scores[id] = Math.min(Math.max(ballot.scores[id] ?? 0, 0), maxScore);
    }
  } else {
    const half = Math.floor(order.length / 2);
    for (const id of order) {
      if (ballot.type === 'ranked') {
        const rank = ballot.ranking.indexOf(id);
        scores[id] = rank === -1 ? 0 : Math.max(maxScore - rank, 0);
      } else {
        scores[id] = preference.indexOf(id) < half ? 1 : 0;
      }
    }
  }
  return { type: 'cardinal', scores };
}

function migrateBallots(draft: ElectionInput) {
  const seats = effectiveSeats(draft);
  const expected = ballotTypeFor(draft.system, seats);
  const order = draft.candidates.map((c) => c.id);
  const maxScore = draft.options?.maxScore ?? MAX_SCORE;
  for (const bloc of draft.blocs) {
    bloc.ballot = convertBallot(bloc.ballot, expected, order, seats, maxScore);
  }
}

export function scopedInputFor(
  input: ElectionInput,
  system: SystemId,
): ElectionInput {
  const seats = SYSTEMS[system].supportsMultiWinner ? input.seats : 1;
  const order = input.candidates.map((c) => c.id);
  const maxScore = input.options?.maxScore ?? MAX_SCORE;
  const expected = ballotTypeFor(system, seats);
  return {
    ...input,
    system,
    seats,
    blocs: input.blocs.map((b) => ({
      ...b,
      ballot: convertBallot(b.ballot, expected, order, seats, maxScore),
    })),
  };
}

interface SandboxState {
  input: ElectionInput;
  past: ElectionInput[];
  future: ElectionInput[];
  notice: string | null;
  setSystem: (system: SystemId) => void;
  setSeats: (seats: number) => void;
  setVoterMode: (mode: 'individual' | 'blocs') => void;
  renameCandidate: (id: string, name: string) => void;
  addCandidate: () => void;
  removeCandidate: (id: string) => void;
  addBloc: () => void;
  updateBloc: (id: string, update: (bloc: VoterBloc) => void) => void;
  removeBloc: (id: string) => void;
  loadPreset: (id: PresetId) => void;
  loadInput: (input: ElectionInput) => boolean;
  setNotice: (notice: string | null) => void;
  undo: () => void;
  redo: () => void;
}

export const useSandbox = create<SandboxState>()((set, get) => {
  const commit = (mutate: (draft: ElectionInput) => void) => {
    const prev = get().input;
    const next = structuredClone(prev);
    mutate(next);
    set((s) => ({
      input: next,
      past: [...s.past, prev].slice(-50),
      future: [],
    }));
  };

  return {
    input: PRESETS.default.build(),
    past: [],
    future: [],
    notice: null,

    setSystem: (system) =>
      commit((d) => {
        d.system = system;
        migrateBallots(d);
      }),

    setSeats: (seats) =>
      commit((d) => {
        d.seats = seats;
        migrateBallots(d);
      }),

    setVoterMode: (mode) => {
      const input = get().input;
      if (mode === input.voterMode) return;
      if (mode === 'individual') {
        const total = input.blocs.reduce((sum, b) => sum + b.count, 0);
        if (total > MAX_INDIVIDUAL_VOTERS) {
          set({
            notice: `مجموع رأی‌دهندگان (${total} نفر) از سقف ${MAX_INDIVIDUAL_VOTERS} رأی‌دهندهٔ حالت فردی بیشتر است؛ ابتدا شمار بلوک‌ها را کاهش دهید.`,
          });
          return;
        }
      }
      set({ notice: null });
      commit((d) => {
        d.voterMode = mode;
      });
    },

    renameCandidate: (id, name) =>
      commit((d) => {
        const c = d.candidates.find((x) => x.id === id);
        if (c) c.name = name;
      }),

    addCandidate: () =>
      commit((d) => {
        if (d.candidates.length >= MAX_CANDIDATES) return;
        let i = 1;
        while (d.candidates.some((c) => c.id === `c${i}`)) i += 1;
        const id = `c${i}`;
        d.candidates.push({
          id,
          name: NAMES_FA[d.candidates.length] ?? `نامزد ${i}`,
          color: PALETTE[d.candidates.length % PALETTE.length],
        });
        const seats = effectiveSeats(d);
        const expected = ballotTypeFor(d.system, seats);
        for (const bloc of d.blocs) {
          bloc.ballot = convertBallot(bloc.ballot, expected, d.candidates.map((c) => c.id), seats, d.options?.maxScore ?? MAX_SCORE);
          if (bloc.ballot.type === 'ranked') bloc.ballot.ranking.push(id);
          if (bloc.ballot.type === 'cardinal') bloc.ballot.scores[id] = 0;
        }
      }),

    removeCandidate: (id) =>
      commit((d) => {
        if (d.candidates.length <= MIN_CANDIDATES) return;
        d.candidates = d.candidates.filter((c) => c.id !== id);
        for (const bloc of d.blocs) {
          if (bloc.ballot.type === 'ranked') {
            bloc.ballot.ranking = bloc.ballot.ranking.filter((x) => x !== id);
          } else if (bloc.ballot.type === 'picks') {
            bloc.ballot.picks = bloc.ballot.picks.filter((x) => x !== id);
          } else {
            delete bloc.ballot.scores[id];
          }
        }
      }),

    addBloc: () =>
      commit((d) => {
        const seats = effectiveSeats(d);
        const expected = ballotTypeFor(d.system, seats);
        const order = d.candidates.map((c) => c.id);
        let i = 1;
        while (d.blocs.some((b) => b.id === `b${i}`)) i += 1;
        let ballot: Ballot;
        if (expected === 'ranked') {
          ballot = { type: 'ranked', ranking: order };
        } else if (expected === 'picks') {
          ballot = { type: 'picks', picks: order.slice(0, seats) };
        } else {
          ballot = {
            type: 'cardinal',
            scores: Object.fromEntries(order.map((id) => [id, 0])),
          };
        }
        d.blocs.push({
          id: `b${i}`,
          label: `گروه ${d.blocs.length + 1}`,
          count: 10,
          ballot,
        });
      }),

    updateBloc: (id, update) =>
      commit((d) => {
        const bloc = d.blocs.find((b) => b.id === id);
        if (bloc) update(bloc);
      }),

    removeBloc: (id) =>
      commit((d) => {
        if (d.blocs.length <= 1) return;
        d.blocs = d.blocs.filter((b) => b.id !== id);
      }),

    loadPreset: (id) => {
      const prev = get().input;
      const next = PRESETS[id].build();
      set((s) => ({
        input: next,
        past: [...s.past, prev].slice(-50),
        future: [],
        notice: null,
      }));
    },

    loadInput: (incoming) => {
      if (
        !incoming ||
        !Array.isArray(incoming.candidates) ||
        !Array.isArray(incoming.blocs) ||
        incoming.blocs.length === 0
      ) {
        return false;
      }
      const prev = get().input;
      set((s) => ({
        input: incoming,
        past: [...s.past, prev].slice(-50),
        future: [],
        notice: null,
      }));
      return true;
    },

    setNotice: (notice) => set({ notice }),

    undo: () => {
      const { past, input, future } = get();
      if (past.length === 0) return;
      const prev = past[past.length - 1];
      set({
        input: prev,
        past: past.slice(0, -1),
        future: [input, ...future].slice(0, 50),
      });
    },

    redo: () => {
      const { past, future, input } = get();
      if (future.length === 0) return;
      const next = future[0];
      set({
        input: next,
        past: [...past, input].slice(-50),
        future: future.slice(1),
      });
    },
  };
});

export interface SandboxResult {
  result: ElectionResult | null;
  error: string | null;
  seats: number;
}

export function useSandboxResult(): SandboxResult {
  const input = useSandbox((s) => s.input);
  return useMemo(() => {
    const seats = effectiveSeats(input);
    try {
      return {
        result: compute({ ...input, seats }),
        error: null,
        seats,
      };
    } catch (e) {
      return {
        result: null,
        error: e instanceof EngineError ? e.message : 'خطای ناشناخته',
        seats,
      };
    }
  }, [input]);
}
