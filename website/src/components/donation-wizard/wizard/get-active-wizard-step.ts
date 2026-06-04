import type { DonationWizardEntry } from './donation-wizard-context';
import type { DonationWizardState } from './types';

type ActiveDonationWizardStep =
	| DonationWizardEntry
	| 'step3Payment'
	| 'step4StripeCheckout'
	| 'step5Onboarding'
	| 'step6ThankYou';

export const getActiveWizardStep = (state: DonationWizardState): ActiveDonationWizardStep | null => {
	if (state.matches('loadingCommunityStats')) {
		return state.context.pendingStep;
	}

	if (state.matches('step1')) {
		return 'step1';
	}

	if (state.matches('step2Monthly')) {
		return 'step2Monthly';
	}

	if (state.matches('step2OneTime')) {
		return 'step2OneTime';
	}

	if (state.matches('step3Payment')) {
		return 'step3Payment';
	}

	if (state.matches('step4StripeCheckout')) {
		return 'step4StripeCheckout';
	}

	if (state.matches('step5Onboarding')) {
		return 'step5Onboarding';
	}

	if (state.matches('step6ThankYou')) {
		return 'step6ThankYou';
	}

	return null;
};
