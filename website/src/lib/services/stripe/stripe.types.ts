import { ContributorReferralSource, CountryCode, Gender } from '@prisma/client';

export type StripeCustomerData = {
	id: string;
	email: string;
	name?: string;
	address?: {
		country?: CountryCode;
	};
};

export type CheckoutMetadata = {
	campaignId?: string;
	[key: string]: string | undefined;
};

export type WebhookResult = {
	contributionId?: string;
	contributorId?: string;
	isNewContributor?: boolean;
	skipReason?: string;
};

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

export type StripePaymentMethod = {
	type: 'card' | 'other';
	label: string;
};
