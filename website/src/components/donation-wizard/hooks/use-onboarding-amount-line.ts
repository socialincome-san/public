'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import type { CompletedDonationSummary } from '../steps/step-stripe-checkout/map-wizard-to-stripe-checkout';

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
