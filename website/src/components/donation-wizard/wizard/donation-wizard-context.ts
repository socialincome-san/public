import type { ContributorCommunityStats } from '@/lib/services/contributor/contributor.types';
import type { CompletedDonationSummary } from '../steps/step-4-stripe/map-wizard-to-stripe-checkout';
import { type DonationAmountContext, getInitialDonationContext } from '../utils/donation-amount';

export type DonationWizardEntry = 'step1' | 'step2Monthly' | 'step2OneTime';

export type StripeCheckoutStatus = 'idle' | 'loading' | 'ready' | 'error';

export type DonationWizardContext = DonationAmountContext & {
	communityStats: ContributorCommunityStats | null;
	pendingStep: DonationWizardEntry | null;
	stripeCheckoutSessionId: string | null;
	stripeClientSecret: string | null;
	stripePublishableKey: string | null;
	stripeCheckoutStatus: StripeCheckoutStatus;
	stripeCheckoutError: string | null;
	completedDonationSummary: CompletedDonationSummary | null;
};

export const getInitialWizardContext = (): DonationWizardContext => ({
	...getInitialDonationContext(),
	communityStats: null,
	pendingStep: null,
	stripeCheckoutSessionId: null,
	stripeClientSecret: null,
	stripePublishableKey: null,
	stripeCheckoutStatus: 'idle',
	stripeCheckoutError: null,
	completedDonationSummary: null,
});
