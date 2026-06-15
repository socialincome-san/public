import { type DonationAmountContext, type OneTimePlanChoice } from '../utils/donation-amount';
import { type DonationWizardContext, getInitialWizardContext } from './donation-wizard-context';

export const wizardContextFromFormAmount = (context: DonationAmountContext): DonationWizardContext => ({
	...getInitialWizardContext(),
	...context,
	selectedTier: '1x',
	paymentMethod: 'qr',
	chargeMonthlyHalfOfOneTimeAmount: false,
	coverTransactionCosts: false,
	oneTimePlanChoice: 'one-time',
	returnsToOneTimePlanStep: false,
	campaignId: context.campaignId,
});

export const oneTimePlanStepDefaults: Pick<
	DonationWizardContext,
	'oneTimePlanChoice' | 'returnsToOneTimePlanStep' | 'chargeMonthlyHalfOfOneTimeAmount'
> = {
	oneTimePlanChoice: 'one-time',
	returnsToOneTimePlanStep: true,
	chargeMonthlyHalfOfOneTimeAmount: false,
};

export const monthlyPlanStepDefaults: Pick<
	DonationWizardContext,
	'returnsToOneTimePlanStep' | 'chargeMonthlyHalfOfOneTimeAmount'
> = {
	returnsToOneTimePlanStep: false,
	chargeMonthlyHalfOfOneTimeAmount: false,
};

export const paymentContextForOneTimePlanChoice = (choice: OneTimePlanChoice) => {
	if (choice === 'monthly-half') {
		return {
			cadence: 'monthly' as const,
			chargeMonthlyHalfOfOneTimeAmount: true,
			selectedTier: '1x' as const,
			returnsToOneTimePlanStep: true,
		};
	}

	return {
		cadence: 'one-time' as const,
		chargeMonthlyHalfOfOneTimeAmount: false,
		returnsToOneTimePlanStep: true,
	};
};
