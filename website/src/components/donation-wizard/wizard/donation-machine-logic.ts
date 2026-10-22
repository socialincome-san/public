import { type DonationAmountContext, type OneTimePlanChoice } from '../utils/donation-amount';
import { type DonationWizardContext, getInitialWizardContext } from './donation-wizard-context';

export const wizardContextFromFormAmount = (context: DonationAmountContext): DonationWizardContext => ({
	...getInitialWizardContext(context.currency),
	...context,
	selectedTier: '1x',
	paymentMethod: 'qr',
	chargeMonthlyHalfOfOneTimeAmount: false,
	coverTransactionCosts: true,
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

/** Reopens a stored donation on the plan step it came from, with the same tier and plan choice. */
export const wizardContextFromResumedDonation = (context: DonationAmountContext): DonationWizardContext => {
	// A monthly gift of half a one-time amount is chosen on the one-time plan step, which starts from the one-time amount.
	if (context.returnsToOneTimePlanStep) {
		return {
			...getInitialWizardContext(context.currency),
			...context,
			cadence: 'one-time',
			chargeMonthlyHalfOfOneTimeAmount: false,
			pendingStep: 'stepPlanOneTime',
		};
	}

	return {
		...getInitialWizardContext(context.currency),
		...context,
		pendingStep: context.cadence === 'monthly' ? 'stepPlanMonthly' : 'stepPlanOneTime',
	};
};
