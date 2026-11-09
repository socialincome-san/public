import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { type Cadence, type DonationAmountContext, getDonationDisplayAmount } from '../../utils/donation-amount';

export type CompletedDonationSummary = {
	amount: number;
	currency: WebsiteCurrency;
	cadence: Cadence;
};

export const buildCompletedDonationSummary = (context: DonationAmountContext): CompletedDonationSummary => ({
	amount: getDonationDisplayAmount(context),
	currency: context.currency,
	cadence: context.cadence,
});
