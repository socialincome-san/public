import Stripe from 'stripe';

export type StripeWebhookEvent = Stripe.Event;

export type StripeChargeData = {
	id: string;
	amount: number;
	currency: string;
	status: Stripe.Charge.Status;
	created: number;
	customer: string;
	payment_intent?: string;
	balance_transaction?: Stripe.BalanceTransaction;
	invoice?: Stripe.Invoice;
};

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
};
