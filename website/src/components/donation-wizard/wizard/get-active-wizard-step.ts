import type { DonationWizardEntry } from './donation-wizard-context';
import type { DonationWizardState } from './types';

export type ActiveDonationWizardStep = DonationWizardEntry | 'step3Payment';

export const getActiveWizardStep = (state: DonationWizardState): ActiveDonationWizardStep | null => {
	if (state.matches('loadingCommunityStats')) {
		return state.context.entryAfterStatsLoad;
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

	return null;
};
