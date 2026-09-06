import { EngineError } from './types';
import { validateInput } from './utils/validate';
import { plurality } from './systems/plurality';
import { runoff } from './systems/runoff';
import { irv } from './systems/irv';
import { condorcet } from './systems/condorcet';
import { borda } from './systems/borda';
import { cardinal } from './systems/cardinal';
import type {
  ElectionInput,
  ElectionResult,
  SystemId,
} from './types';

export interface SystemDef {
  id: SystemId;
  nameFa: string;
  shortFa: string;
  supportsMultiWinner: boolean;
  compute: (input: ElectionInput) => ElectionResult;
}

export const SYSTEMS: Record<SystemId, SystemDef> = {
  plurality: {
    id: 'plurality',
    nameFa: 'اکثریت نسبی (اول‌شدن)',
    shortFa: 'نسبی',
    supportsMultiWinner: true,
    compute: plurality,
  },
  runoff: {
    id: 'runoff',
    nameFa: 'دو مرحله‌ای',
    shortFa: 'دو مرحله‌ای',
    supportsMultiWinner: false,
    compute: runoff,
  },
  irv: {
    id: 'irv',
    nameFa: 'انتقال‌پذیر یک‌مرحله‌ای (IRV)',
    shortFa: 'IRV',
    supportsMultiWinner: true,
    compute: irv,
  },
  condorcet: {
    id: 'condorcet',
    nameFa: 'کندورسه',
    shortFa: 'کندورسه',
    supportsMultiWinner: false,
    compute: condorcet,
  },
  borda: {
    id: 'borda',
    nameFa: 'شمارش بوردا',
    shortFa: 'بوردا',
    supportsMultiWinner: true,
    compute: borda,
  },
  approval: {
    id: 'approval',
    nameFa: 'رأی تأییدی',
    shortFa: 'تأییدی',
    supportsMultiWinner: true,
    compute: cardinal,
  },
  score: {
    id: 'score',
    nameFa: 'رأی امتیازی',
    shortFa: 'امتیازی',
    supportsMultiWinner: true,
    compute: cardinal,
  },
};

export function compute(input: ElectionInput): ElectionResult {
  const errors = validateInput(input);
  if (errors.length > 0) {
    throw new EngineError('validation', errors.join('; '));
  }
  return SYSTEMS[input.system].compute(input);
}

export { validateInput } from './utils/validate';
export { ballotTypeFor } from './utils/ballots';
export * from './types';
