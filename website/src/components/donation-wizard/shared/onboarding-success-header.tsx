'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { CircleCheck } from 'lucide-react';
import type { CompletedDonationSummary } from '../steps/step-4-stripe/map-wizard-to-stripe-checkout';

export const useOnboardingAmountLine = (completedDonationSummary: CompletedDonationSummary | null) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency } = useI18n();

	if (!completedDonationSummary) {
		return undefined;
	}

	return t(
		completedDonationSummary.cadence === 'monthly'
			? 'thankYou.messageWithAmountMonthly'
			: 'thankYou.messageWithAmountOneTime',
		{ amount: `${currency} ${completedDonationSummary.amount}` },
	);
};

type OnboardingSuccessHeaderProps = {
	amountLine: string | undefined;
};

export const OnboardingSuccessHeader = ({ amountLine }: OnboardingSuccessHeaderProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	return (
		<div className="flex items-center gap-2 px-4">
			<CircleCheck className="text-foreground size-11 shrink-0" strokeWidth={1.5} aria-hidden />
			<div className="flex min-w-0 flex-col gap-1">
				<p className="text-foreground text-base leading-normal font-bold">{t('onboarding.successTitle')}</p>
				<p className="text-foreground text-sm leading-normal">{amountLine ?? t('thankYou.message')}</p>
			</div>
		</div>
	);
};
