import { type Cadence, type DonationAmountContext, getDonationDisplayAmount } from '../../utils/donation-amount';

export type CompletedDonationSummary = {
	amount: number;
	cadence: Cadence;
};

export const buildCompletedDonationSummary = (context: DonationAmountContext): CompletedDonationSummary => ({
	amount: getDonationDisplayAmount(context),
	cadence: context.cadence,
});
