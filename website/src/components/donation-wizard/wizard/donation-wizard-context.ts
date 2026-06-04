import type { ContributorCommunityStats } from '@/lib/services/contributor/contributor.types';
import { type DonationAmountContext, getInitialDonationContext } from '../utils/donation-amount';

export type DonationWizardEntry = 'step1' | 'step2Monthly' | 'step2OneTime';

export type DonationWizardContext = DonationAmountContext & {
	communityStats: ContributorCommunityStats | null;
	pendingStep: DonationWizardEntry | null;
};

export const getInitialWizardContext = (): DonationWizardContext => ({
	...getInitialDonationContext(),
	communityStats: null,
	pendingStep: null,
});
