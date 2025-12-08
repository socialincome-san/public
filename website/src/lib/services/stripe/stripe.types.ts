import { ContributorReferralSource, Gender } from '@prisma/client';

export type StripeCustomerData = {
	id: string;
	email: string;
	name?: string;
	address?: {
		country?: string;
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
	from: Date;
	until: Date;
	status: string;
	amount: number;
	interval: string;
	currency: string;
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
			country: string;
		};
	};
};
