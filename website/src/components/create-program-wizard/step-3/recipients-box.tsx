'use client';

import { Slider } from '@/components/slider';
import { IndirectImpactNotice } from './indirect-impact-notice';

type Props = {
  amountOfRecipients: number;
  filteredRecipients: number;
  onChange: (value: number) => void;
};

export const RecipientsBox = ({ amountOfRecipients, filteredRecipients, onChange }: Props) => {
  const noCandidates = filteredRecipients === 0;
  const atMax = !noCandidates && amountOfRecipients === filteredRecipients;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border">
      <div className="space-y-6 p-8">
        <h3 className="font-medium">Recipients for program start</h3>

        <div className="flex justify-center">
          <div className="rounded-lg border px-5 py-2 text-3xl">{noCandidates ? 0 : amountOfRecipients}</div>
        </div>

        {noCandidates ? (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            No candidates are currently available in the candidate pool. Please go back to Step 2 and adjust the selected
            causes or ensure candidates are available.
          </div>
        ) : (
          <>
            <Slider
              data-testid="recipients-slider"
              min={1}
              max={filteredRecipients}
              step={1}
              value={[amountOfRecipients]}
              onValueChange={([v]) => onChange(v)}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>{filteredRecipients}</span>
            </div>

            {atMax && (
              <p className="text-center text-xs text-muted-foreground">
                The maximum is determined by the number of candidates currently available for your selected causes.
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-auto">
        <IndirectImpactNotice recipients={noCandidates ? 0 : amountOfRecipients} />
      </div>
    </div>
  );
};
