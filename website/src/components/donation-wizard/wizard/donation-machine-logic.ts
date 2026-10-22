import { type DonationAmountContext, type OneTimePlanChoice } from '../utils/donation-amount';
import { type DonationWizardContext, getInitialWizardContext, type ResumableWizardStep } from './donation-wizard-context';

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

/** Reopens a donation from the donation bar on the step it was left, with the same choices. */
export const wizardContextFromResumedDonation = (
	context: DonationAmountContext,
	step: ResumableWizardStep,
): DonationWizardContext => ({
	...getInitialWizardContext(context.currency),
	...context,
	pendingStep: step,
	// These steps are normally entered through a payment choice, which also records how the donor pays.
	...(step === 'stepStripeCheckout'
		? { wizardPaymentSource: 'stripe' as const, stripeCheckoutStatus: 'loading' as const }
		: {}),
	...(step === 'stepQrContact' ? { wizardPaymentSource: 'qr' as const } : {}),
});
