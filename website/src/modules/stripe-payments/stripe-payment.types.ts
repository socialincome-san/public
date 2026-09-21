import type {
	ContributorReferralSource,
	CountryCode,
	Gender,
	SubscriptionCancellationReason,
} from '@/generated/prisma/enums';
import type { ContributorRecord } from '@/modules/contributors/contributor.types';

export type StripeEmbeddedCheckoutSessionInput = {
	wizardContext: DonationWizardAmountContext;
	currency?: string;
	returnPath?: string;
	stripeCustomerId: string | null;
};

export type DonationWizardAmountContext = {
	monthlyIncome: number | null;
	selectedAmount: 25 | 50 | 100 | 'other' | null;
	customAmount: number | null;
	cadence: 'monthly' | 'one-time';
	selectedTier: '1x' | '2x';
	paymentMethod: 'qr' | 'online';
	chargeMonthlyHalfOfOneTimeAmount: boolean;
	coverTransactionCosts: boolean;
	oneTimePlanChoice: 'one-time' | 'monthly-half';
	returnsToOneTimePlanStep: boolean;
	campaignId?: string;
};

export type PortalProgramDonationCheckoutInput = {
	amount: number;
	programId: string;
	currency?: string;
	intervalCount?: number;
	recurring?: boolean;
};

export type StripeEmbeddedCheckoutResult = {
	clientSecret: string;
	sessionId: string;
	publishableKey: string;
};

export type StripeCheckoutCustomerPrefill = {
	email?: string;
	firstname?: string;
	lastname?: string;
	country?: CountryCode;
};

export type StripeCheckoutOnboardingPrefill = StripeCheckoutCustomerPrefill & {
	needsOnboarding: boolean;
};

export type UpdateContributorAfterCheckoutInput = {
	stripeCheckoutSessionId: string;
	user: {
		email: string;
		language: string;
		personal: {
			name: string;
			lastname: string;
			gender?: Gender;
			referral?: ContributorReferralSource;
		};
		address: {
			country: CountryCode;
		};
	};
};

export type UpdateContributorAfterCheckoutResult = ContributorRecord;

export type UpdateContributorReferralAfterCheckoutInput = {
	stripeCheckoutSessionId: string;
	referral: ContributorReferralSource;
};

export type UpdateContributorReferralAfterCheckoutResult = ContributorRecord;

export type StripeSubscriptionRow = {
	id: string;
	created: Date;
	status: string;
	amount: number;
	interval: string;
	currency: string;
	paymentMethod: StripePaymentMethod;
};

export type StripeSubscriptionTableView = {
	rows: StripeSubscriptionRow[];
};

export type StripeSubscriptionTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type StripeSubscriptionPaginatedTableView = {
	rows: StripeSubscriptionRow[];
	totalCount: number;
};

export type StripePaymentMethod = {
	type: 'card' | 'other';
	label: string;
};

export type StripeSubscriptionDetails = {
	brand?: string;
	last4?: string;
	currentPeriodEnd: Date | null;
};

export type StripeBillingPortalSessionUrl = string;

export const APPLY_PAYMENT_METHOD_QUERY_PARAM = 'apply_payment_method';

export type CreateManageSubscriptionsSessionInput = {
	stripeCustomerId: string | null;
	language: string | null;
	flow: 'payment_method_update';
	subscriptionId: string;
};

export type ApplyCustomerDefaultPaymentMethodInput = {
	contributorId: string;
	stripeCustomerId: string | null;
	subscriptionId: string;
};

export type StripeContributorNameParts = {
	firstName: string;
	lastName: string;
};

export type CheckoutMetadata = {
	campaignId?: string;
	accountId?: string;
	source?: string;
	coverTransactionCosts?: string;
	[key: string]: string | undefined;
};

export type StripeWebhookResult = {
	contributionId?: string;
	contributorId?: string;
	isNewContributor?: boolean;
	skipReason?: string;
};

export type UpdateContributorSubscriptionAmountInput = {
	contributorId: string;
	subscriptionId: string;
	amount: number;
	coverTransactionCosts?: boolean;
};

export type CancelContributorSubscriptionInput = {
	contributorId: string;
	subscriptionId: string;
	reason: SubscriptionCancellationReason;
};
