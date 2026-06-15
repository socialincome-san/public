import type { DonationWizardEntry } from './donation-wizard-context';
import type { DonationWizardState } from './types';

export type ActiveDonationWizardStep =
	| DonationWizardEntry
	| 'stepPayment'
	| 'stepQrContact'
	| 'stepQrBill'
	| 'stepStripeCheckout'
	| 'stepOnboardingPersonal'
	| 'stepOnboardingReferral'
	| 'stepThankYou';

export const getActiveWizardStep = (state: DonationWizardState): ActiveDonationWizardStep | null => {
	if (state.matches('loadingCommunityStats')) {
		return state.context.pendingStep;
	}

	if (state.matches('stepAmount')) {
		return 'stepAmount';
	}

	if (state.matches('stepPlanMonthly')) {
		return 'stepPlanMonthly';
	}

	if (state.matches('stepPlanOneTime')) {
		return 'stepPlanOneTime';
	}

	if (state.matches('stepPayment')) {
		return 'stepPayment';
	}

	if (state.matches('stepQrContact')) {
		return 'stepQrContact';
	}

	if (state.matches('stepQrBill')) {
		return 'stepQrBill';
	}

	if (state.matches('stepStripeCheckout')) {
		return 'stepStripeCheckout';
	}

	if (state.matches('stepOnboardingPersonal')) {
		return 'stepOnboardingPersonal';
	}

	if (state.matches('stepOnboardingReferral')) {
		return 'stepOnboardingReferral';
	}

	if (state.matches('stepThankYou')) {
		return 'stepThankYou';
	}

	return null;
};
