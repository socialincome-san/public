import {
	DonationInterval,
	SubscriptionCancellationReason,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
	type Currency,
} from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';

const stripeSubscriptionSelect = {
	id: true,
	stripeSubscriptionId: true,
	campaignId: true,
	status: true,
} as const;

export const findOwnedActiveStripeSubscription = async (contributorId: string, subscriptionId: string) =>
	prisma.subscription.findFirst({
		where: {
			id: subscriptionId,
			contributorId,
			paymentMethod: SubscriptionPaymentMethod.stripe,
			status: SubscriptionStatus.active,
		},
		select: {
			id: true,
			campaignId: true,
			currency: true,
			stripeSubscriptionId: true,
		},
	});

export const findOwnedStripeSubscription = async (contributorId: string, subscriptionId: string) =>
	prisma.subscription.findFirst({
		where: {
			id: subscriptionId,
			contributorId,
			paymentMethod: SubscriptionPaymentMethod.stripe,
		},
		select: {
			id: true,
			stripeSubscriptionId: true,
			status: true,
		},
	});

export const findStripeSubscriptionByStripeId = async (stripeSubscriptionId: string) =>
	prisma.subscription.findUnique({
		where: { stripeSubscriptionId },
		select: { id: true, campaignId: true },
	});

export const updateOwnedStripeSubscriptionCancellation = async (input: {
	id: string;
	status: SubscriptionStatus;
	canceledAt: Date;
	cancellationReason: SubscriptionCancellationReason;
}) =>
	prisma.subscription.update({
		where: { id: input.id },
		data: {
			status: input.status,
			canceledAt: input.canceledAt,
			cancellationReason: input.cancellationReason,
		},
		select: { id: true },
	});

export const updateStripeSubscriptionFromStripe = async (input: {
	stripeSubscriptionId: string;
	contributorId: string;
	campaignId: string;
	amount: number;
	currency: Currency;
	interval: DonationInterval;
	status: SubscriptionStatus;
	canceledAt: Date | null;
	coverTransactionCosts: boolean;
}) => {
	const sharedFields = {
		contributorId: input.contributorId,
		campaignId: input.campaignId,
		amount: input.amount,
		currency: input.currency,
		interval: input.interval,
		status: input.status,
		paymentMethod: SubscriptionPaymentMethod.stripe,
		canceledAt: input.canceledAt,
		coverTransactionCosts: input.coverTransactionCosts,
	};

	return prisma.subscription.upsert({
		where: { stripeSubscriptionId: input.stripeSubscriptionId },
		create: {
			stripeSubscriptionId: input.stripeSubscriptionId,
			...sharedFields,
		},
		update: sharedFields,
		select: stripeSubscriptionSelect,
	});
};

export const updateStripeSubscriptionLifecycle = async (input: {
	id: string;
	status: SubscriptionStatus;
	canceledAt: Date | null;
}) =>
	prisma.subscription.update({
		where: { id: input.id },
		data: {
			status: input.status,
			canceledAt: input.canceledAt,
		},
		select: stripeSubscriptionSelect,
	});
