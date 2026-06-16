import { type DonationAmountContext } from '@/components/donation-wizard/utils/donation-amount';
import { type Contributor, ContributorReferralSource, CountryCode, Gender } from '@/generated/prisma/client';

export type StripeEmbeddedCheckoutSessionInput = {
	wizardContext: DonationAmountContext;
	currency?: string;
	stripeCustomerId: string | null;
};

export type StripeEmbeddedCheckoutCreateInput = {
	amount: number;
	returnUrl?: string;
	recurring?: boolean;
	currency?: string;
	intervalCount?: number;
	stripeCustomerId?: string | null;
	campaignId?: string;
	accountId?: string;
	source?: string;
};

export type StripeHostedCheckoutCreateInput = {
	amount: number;
	successUrl: string;
	recurring?: boolean;
	currency?: string;
	intervalCount?: number;
	stripeCustomerId?: string | null;
	campaignId?: string;
	accountId?: string;
	source?: string;
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

export type UpdateContributorAfterCheckoutResult = Contributor;

export type UpdateContributorReferralAfterCheckoutInput = {
	stripeCheckoutSessionId: string;
	referral: ContributorReferralSource;
};

export type UpdateContributorReferralAfterCheckoutResult = Contributor;

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

export type StripeBillingPortalSessionUrl = string;

export type StripeCustomerData = {
	id: string;
	email: string;
	name?: string;
	address?: {
		country?: string;
	};
};

export type StripeContributorNameParts = {
	firstName: string;
	lastName: string;
};

export type CheckoutMetadata = {
	campaignId?: string;
	accountId?: string;
	source?: string;
	[key: string]: string | undefined;
};

export type StripeWebhookResult = {
	contributionId?: string;
	contributorId?: string;
	isNewContributor?: boolean;
	skipReason?: string;
};
