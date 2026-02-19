'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/tool-tip';

type Props = {
  recipients: number;
};

export const IndirectImpactNotice = ({ recipients }: Props) => {
  const indirect = recipients * 5;

  return (
    <div className="flex items-center gap-3 rounded-b-xl bg-green-200/70 px-6 py-4 text-sm">
      <span className="text-lg">🎉</span>

      <p>
        {recipients} recipients benefit{' '}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline cursor-help underline decoration-dotted underline-offset-4">
                {indirect.toLocaleString('de-CH')} additional indirect people
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px] text-left">
              On average, each supported recipient positively impacts around five additional people in their household and
              community.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>{' '}
        in poverty.
      </p>
    </div>
  );
};
