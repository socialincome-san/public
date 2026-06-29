'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { CircleCheck } from 'lucide-react';

type OnboardingSuccessHeaderProps = {
	amountLine: string | undefined;
	showAccountCreatedDescription?: boolean;
};

export const OnboardingSuccessHeader = ({
	amountLine,
	showAccountCreatedDescription = false,
}: OnboardingSuccessHeaderProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	return (
		<div className="flex items-center gap-2 px-4">
			<CircleCheck className="text-foreground size-11 shrink-0" strokeWidth={1.5} aria-hidden />
			<div className="flex min-w-0 flex-col gap-1">
				<p className="text-foreground text-base leading-normal font-bold">{t('onboarding.successTitle')}</p>
				{showAccountCreatedDescription && (
					<p className="text-foreground text-sm leading-normal">{t('onboarding.accountCreatedDescription')}</p>
				)}
				<p className="text-foreground text-sm leading-normal">{amountLine ?? t('thankYou.message')}</p>
			</div>
		</div>
	);
};
