import { SubscriptionPaymentMethod, SubscriptionStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';

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
