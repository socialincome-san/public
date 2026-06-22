import type { ContributorCommunityStats } from '@/lib/services/contributor/contributor.types';
import type { CompletedDonationSummary } from '../steps/step-stripe-checkout/map-wizard-to-stripe-checkout';
import { type DonationAmountContext, getInitialDonationContext } from '../utils/donation-amount';

export type DonationWizardEntry = 'stepAmount' | 'stepPlanMonthly' | 'stepPlanOneTime';

type StripeCheckoutStatus = 'idle' | 'loading' | 'ready' | 'error';

type QrBillStatus = 'idle' | 'loading' | 'ready' | 'error';

type WizardPaymentSource = 'stripe' | 'qr' | null;

export type QrDonorContext = {
	firstName: string;
	lastName: string;
	email: string;
	language: string;
};

export type DonationWizardContext = DonationAmountContext & {
	communityStats: ContributorCommunityStats | null;
	pendingStep: DonationWizardEntry | null;
	stripeCheckoutSessionId: string | null;
	stripeClientSecret: string | null;
	stripePublishableKey: string | null;
	stripeCheckoutStatus: StripeCheckoutStatus;
	stripeCheckoutError: string | null;
	completedDonationSummary: CompletedDonationSummary | null;
	wizardPaymentSource: WizardPaymentSource;
	qrDonor: QrDonorContext | null;
	qrContributorReferenceId: string | null;
	qrContributionReferenceId: string | null;
	qrBillSvg: string | null;
	qrBillStatus: QrBillStatus;
	qrBillError: string | null;
};

export const resetStripeCheckoutContext = {
	stripeCheckoutSessionId: null,
	stripeClientSecret: null,
	stripePublishableKey: null,
	stripeCheckoutStatus: 'idle' as const,
	stripeCheckoutError: null,
};

export const resetQrBillContext = {
	qrDonor: null,
	qrContributorReferenceId: null,
	qrContributionReferenceId: null,
	qrBillSvg: null,
	qrBillStatus: 'idle' as const,
	qrBillError: null,
};

export const getInitialWizardContext = (): DonationWizardContext => ({
	...getInitialDonationContext(),
	communityStats: null,
	pendingStep: null,
	...resetStripeCheckoutContext,
	completedDonationSummary: null,
	wizardPaymentSource: null,
	...resetQrBillContext,
});
