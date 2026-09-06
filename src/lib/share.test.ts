import { describe, expect, it } from 'vitest';
import { decodeScenario, encodeScenario } from './share';
import type { ElectionInput } from '@/lib/electoral';

const SCENARIO: ElectionInput = {
  candidates: [
    { id: 'c1', name: 'آبی', color: '#2563eb' },
    { id: 'c2', name: 'سبز', color: '#16a34a' },
    { id: 'c3', name: 'نارنجی', color: '#ea580c' },
  ],
  blocs: [
    {
      id: 'b1',
      label: 'گروه اول',
      count: 35,
      ballot: { type: 'ranked', ranking: ['c1', 'c3', 'c2'] },
    },
    {
      id: 'b2',
      label: 'گروه دوم',
      count: 33,
      ballot: { type: 'ranked', ranking: ['c2', 'c3', 'c1'] },
    },
    {
      id: 'b3',
      label: 'گروه سوم',
      count: 32,
      ballot: { type: 'ranked', ranking: ['c3', 'c2', 'c1'] },
    },
  ],
  system: 'irv',
  seats: 2,
  voterMode: 'blocs',
};

describe('scenario sharing', () => {
  it('round-trips a scenario through encode/decode', async () => {
    const code = await encodeScenario(SCENARIO);
    expect(code.startsWith('c1') || code.startsWith('p1')).toBe(true);
    const decoded = await decodeScenario(code);
    expect(decoded).toEqual(SCENARIO);
  });

  it('rejects invalid codes', async () => {
    expect(await decodeScenario('garbage')).toBeNull();
    expect(await decodeScenario('c1###not-base64###')).toBeNull();
  });

  it('rejects codes that decode to the wrong shape', async () => {
    const bad = await encodeScenario({
      wrong: true,
    } as unknown as ElectionInput);
    expect(await decodeScenario(bad)).toBeNull();
  });
});
