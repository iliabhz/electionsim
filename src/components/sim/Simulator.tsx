'use client';

import SandboxSetup from './SandboxSetup';
import PairwiseMatrix from './PairwiseMatrix';
import RoundTimeline from './RoundTimeline';
import SeatPodium from './SeatPodium';
import TallyBarChart from './TallyBarChart';
import TransferFlow from './TransferFlow';
import type { PresetId } from '@/lib/store/sandbox';
import { useSandbox, useSandboxResult } from '@/lib/store/sandbox';

export default function Simulator({
  initialPreset,
  presets,
  setupTitleFa,
}: {
  initialPreset?: PresetId;
  presets?: PresetId[];
  setupTitleFa?: string;
}) {
  const input = useSandbox((s) => s.input);
  const { result, error, seats } = useSandboxResult();

  return (
    <div className="space-y-6">
      <SandboxSetup
        presets={presets}
        titleFa={setupTitleFa}
        initialPreset={initialPreset}
      />

      <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        {error ? (
          <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            خطا در محاسبه: {error}
          </div>
        ) : result ? (
          <>
            <div aria-live="polite">
              <SeatPodium
                winners={result.winners}
                candidates={input.candidates}
                result={result}
                seats={seats}
                systemId={input.system}
              />
            </div>
            {result.kind === 'tally' && result.tallies && (
              <TallyBarChart
                rows={result.tallies}
                candidates={input.candidates}
                winnerIds={result.winners.map((w) => w.candidateId)}
                title="جدول نتایج"
              />
            )}
            {result.kind === 'rounds' && (
              <TransferFlow
                rounds={result.rounds}
                candidates={input.candidates}
              />
            )}
            {result.kind === 'rounds' && (
              <RoundTimeline result={result} candidates={input.candidates} />
            )}
            {result.kind === 'pairwise' && (
              <PairwiseMatrix result={result} candidates={input.candidates} />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
