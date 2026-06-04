import type { DonationWizardEntry } from './donation-wizard-context';
import type { DonationWizardState } from './types';

type ActiveDonationWizardStep =
	| DonationWizardEntry
	| 'step3Payment'
	| 'step4StripeCheckout'
	| 'step5OnboardingPersonal'
	| 'step6OnboardingReferral'
	| 'step7ThankYou';

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

	if (state.matches('step5OnboardingPersonal')) {
		return 'step5OnboardingPersonal';
	}

	if (state.matches('step6OnboardingReferral')) {
		return 'step6OnboardingReferral';
	}

	if (state.matches('step7ThankYou')) {
		return 'step7ThankYou';
	}

	return null;
};
