'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/tool-tip';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';

type Props = {
	recipients: number;
};

export const IndirectImpactNotice = ({ recipients }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });
	const indirect = recipients * 5;

	return (
		<div className="flex items-center gap-3 rounded-b-xl bg-green-200/70 px-6 py-4 text-sm">
			<span className="text-lg">🎉</span>

			<p>
				{t('step3.indirect_notice.prefix', { recipients })}{' '}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="inline cursor-help underline decoration-dotted underline-offset-4">
								{t('step3.indirect_notice.indirect_people', { indirect: indirect.toLocaleString('de-CH') })}
							</span>
						</TooltipTrigger>
						<TooltipContent className="max-w-[220px] text-left">{t('step3.indirect_notice.tooltip')}</TooltipContent>
					</Tooltip>
				</TooltipProvider>{' '}
				{t('step3.indirect_notice.suffix')}
			</p>
		</div>
	);
};
