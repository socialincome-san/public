'use client';

import { useContributorSession } from '@/lib/firebase/hooks/useContributorSession';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { cn } from '@/lib/utils/cn';
import { Info } from 'lucide-react';

const hintItemClass = cn('flex items-start gap-2 text-left text-sm leading-normal text-muted-foreground');

export const QrContactHintsPanel = () => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { contributorSession } = useContributorSession();

	return (
		<div className="flex w-full flex-col gap-4 md:gap-5 md:px-6 md:pt-5">
			<h3 className="text-left text-lg leading-none font-medium md:text-xl">{t('stepQrContact.hintsTitle')}</h3>
			<ul className="flex flex-col gap-4">
				{!contributorSession ? (
					<li className={hintItemClass}>
						<Info className="text-foreground mt-0.5 size-[18px] shrink-0" aria-hidden />
						<span>{t('stepQrContact.accountCreateHint')}</span>
					</li>
				) : null}
				<li className={hintItemClass}>
					<Info className="text-foreground mt-0.5 size-[18px] shrink-0" aria-hidden />
					<span>{t('stepQrContact.noBackAfterGenerateHint')}</span>
				</li>
			</ul>
		</div>
	);
};
