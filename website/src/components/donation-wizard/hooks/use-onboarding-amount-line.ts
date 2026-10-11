'use client';

import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { useTranslations } from 'next-intl';
import type { CompletedDonationSummary } from '../steps/step-stripe-checkout/map-wizard-to-stripe-checkout';

export const useOnboardingAmountLine = (completedDonationSummary: CompletedDonationSummary | null) => {
	const t = useTranslations('donation-wizard');
	const currency = useWebsiteCurrency();

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
