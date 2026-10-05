'use client';

import { useI18n } from '@/lib/i18n/use-i18n';
import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import type { CompletedDonationSummary } from '../steps/step-stripe-checkout/map-wizard-to-stripe-checkout';

export const useOnboardingAmountLine = (completedDonationSummary: CompletedDonationSummary | null) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();

	if (!completedDonationSummary) {
		return undefined;
	}

	return t(
		completedDonationSummary.cadence === 'monthly'
			? 'onboarding.donatedThankYouMonthly'
			: 'onboarding.donatedThankYouOneTime',
		{
			currency,
			amount: completedDonationSummary.amount.toFixed(2),
		},
	);
};
