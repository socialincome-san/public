import { Currency, DonationInterval, SubscriptionStatus } from '@/generated/prisma/enums';
import { isValidCurrency } from '@/lib/types/currency';
import Stripe from 'stripe';

export const resolveStripeResourceId = (value: string | { id: string } | null | undefined): string | null => {
	if (!value) {
		return null;
	}
	if (typeof value === 'string') {
		return value;
	}

	return value.id;
};

export const shouldSkipStripeSubscriptionStatus = (status: string): boolean =>
	status === 'incomplete' || status === 'incomplete_expired';

export const mapStripeSubscriptionStatus = (status: string, endedAt: number | null): SubscriptionStatus | null => {
	if (shouldSkipStripeSubscriptionStatus(status)) {
		return null;
	}

	if (status === 'canceled') {
		return endedAt ? SubscriptionStatus.ended : SubscriptionStatus.canceled;
	}

	if (status === 'active' || status === 'trialing' || status === 'past_due' || status === 'unpaid' || status === 'paused') {
		return SubscriptionStatus.active;
	}

	return null;
};

export const mapStripeRecurringInterval = (interval: string, intervalCount: number): DonationInterval | null => {
	if (interval === 'month' && intervalCount === 1) {
		return DonationInterval.monthly;
	}

	return null;
};

export const mapStripePriceAmount = (unitAmount: number | null): number | null => {
	if (unitAmount === null || unitAmount < 0) {
		return null;
	}

	return unitAmount / 100;
};

export const resolveStripeSubscriptionIdFromInvoice = (invoice: Stripe.Invoice): string | null => {
	const fromParent = invoice.parent?.subscription_details?.subscription;
	if (fromParent) {
		return resolveStripeResourceId(fromParent);
	}

	const legacySubscription = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null })
		.subscription;

	return resolveStripeResourceId(legacySubscription);
};

export type MappedStripeSubscriptionLifecycle = {
	status: SubscriptionStatus;
	canceledAt: Date | null;
};

export const resolveStripeSubscriptionCanceledAt = (subscription: Stripe.Subscription): Date => {
	if (subscription.canceled_at) {
		return new Date(subscription.canceled_at * 1000);
	}

	return new Date();
};

/** Status/cancel fields only — safe for webhook payloads without expanded prices. */
export const mapStripeSubscriptionLifecycle = (
	subscription: Stripe.Subscription,
): MappedStripeSubscriptionLifecycle | null => {
	const status = mapStripeSubscriptionStatus(subscription.status, subscription.ended_at);
	if (!status) {
		return null;
	}

	return {
		status,
		canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
	};
};

export type MappedStripeSubscriptionPriceFields = {
	amount: number;
	currency: Currency;
	interval: DonationInterval;
};

export const mapStripeSubscriptionPriceFields = (
	subscription: Stripe.Subscription,
): MappedStripeSubscriptionPriceFields | null => {
	const price = subscription.items.data[0]?.price;
	if (!price?.recurring) {
		return null;
	}

	const interval = mapStripeRecurringInterval(price.recurring.interval, price.recurring.interval_count);
	if (!interval) {
		return null;
	}

	const amount = mapStripePriceAmount(price.unit_amount);
	if (amount === null) {
		return null;
	}

	const currencyCode = price.currency.toUpperCase();
	if (!isValidCurrency(currencyCode)) {
		return null;
	}

	return {
		amount,
		currency: currencyCode,
		interval,
	};
};

export type MappedStripeSubscriptionFields = MappedStripeSubscriptionLifecycle & MappedStripeSubscriptionPriceFields;

export const mapStripeSubscriptionFields = (subscription: Stripe.Subscription): MappedStripeSubscriptionFields | null => {
	const lifecycle = mapStripeSubscriptionLifecycle(subscription);
	if (!lifecycle) {
		return null;
	}

	const priceFields = mapStripeSubscriptionPriceFields(subscription);
	if (!priceFields) {
		return null;
	}

	return {
		...lifecycle,
		...priceFields,
	};
};

export type UpsertBankStandingOrderInput = {
	bankStandingOrderReference: string;
	contributorId: string;
	campaignId: string;
	amount: number;
	currency: Currency;
	status?: SubscriptionStatus;
	canceledAt?: Date | null;
};
