'use client';

import { useEffect, useRef } from 'react';
import CandidatesEditor from './CandidatesEditor';
import BlocEditor from './BlocEditor';
import IndividualVoterTable from './IndividualVoterTable';
import ModeBar from './ModeBar';
import type { PresetId } from '@/lib/store/sandbox';
import { PRESETS, useSandbox } from '@/lib/store/sandbox';
import { decodeScenario } from '@/lib/share';

export const ALL_PRESET_ORDER: PresetId[] = [
  'default',
  'spoiler',
  'irv-paradox',
  'france-runoff',
  'condorcet-cycle',
  'borda-burying',
  'approval-bullet',
  'majority-sweep',
];

export default function SandboxSetup({
  presets,
  titleFa = 'سناریوهای آماده',
  initialPreset,
}: {
  presets?: PresetId[];
  titleFa?: string;
  initialPreset?: PresetId;
}) {
  const input = useSandbox((s) => s.input);
  const loadPreset = useSandbox((s) => s.loadPreset);
  const loadInput = useSandbox((s) => s.loadInput);
  const setNotice = useSandbox((s) => s.setNotice);
  const order = presets ?? ALL_PRESET_ORDER;
  const bootLoaded = useRef(false);

  useEffect(() => {
    if (bootLoaded.current) return;
    bootLoaded.current = true;
    const code = new URLSearchParams(window.location.search).get('s');
    if (!code) {
      if (initialPreset) loadPreset(initialPreset);
      return;
    }
    decodeScenario(code).then((decoded) => {
      if (decoded && loadInput(decoded)) {
        setNotice('سناریو از لینک بارگذاری شد.');
      } else {
        setNotice('لینک سناریو معتبر نیست؛ از سناریوهای آماده استفاده کنید.');
      }
    });
  }, [initialPreset, loadPreset, loadInput, setNotice]);

  return (
    <div className="space-y-6">
      <ModeBar />

      <div className="flex flex-wrap gap-2">
        <span className="py-1.5 text-sm font-medium">{titleFa}:</span>
        {order.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => loadPreset(id)}
            className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-900"
          >
            {PRESETS[id].titleFa}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <CandidatesEditor />
        {input.voterMode === 'blocs' ? <BlocEditor /> : <IndividualVoterTable />}
      </div>
    </div>
  );
}
