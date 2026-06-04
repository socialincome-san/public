'use client';

import { useContributorSession } from '@/lib/firebase/hooks/useContributorSession';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { cn } from '@/lib/utils/cn';
import { Info } from 'lucide-react';

const hintItemClass = cn('flex items-start gap-2 text-sm leading-normal text-muted-foreground md:text-left');

export const QrContactHintsPanel = () => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { contributorSession } = useContributorSession();

	return (
		<div className="mx-auto flex w-full max-w-[400px] flex-col gap-4 md:max-w-none md:gap-5 md:px-6 md:pt-5">
			<h3 className="text-center text-lg leading-none font-medium md:text-left md:text-xl">
				{t('stepQrContact.hintsTitle')}
			</h3>
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
