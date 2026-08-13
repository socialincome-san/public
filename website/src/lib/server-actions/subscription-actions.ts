'use server';

import { type SubscriptionCancellationReason } from '@/generated/prisma/enums';
import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import { isSubscriptionCancellationReason } from '@/lib/services/subscription/subscription-cancellation';

export const updateSubscriptionAmountAction = async (subscriptionId: string, amount: number) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return await services.stripe.updateContributorSubscriptionAmount({
		contributorId: sessionResult.data.id,
		subscriptionId,
		amount,
	});
};

export const createUpdatePaymentMethodSessionAction = async () => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return await services.stripe.createManageSubscriptionsSession(
		sessionResult.data.stripeCustomerId,
		sessionResult.data.language,
		'payment_method_update',
	);
};

export const cancelSubscriptionAction = async (subscriptionId: string, reason: SubscriptionCancellationReason) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	if (!isSubscriptionCancellationReason(reason)) {
		return { success: false as const, error: 'Invalid cancellation reason' };
	}

	return await services.stripe.cancelContributorSubscription({
		contributorId: sessionResult.data.id,
		subscriptionId,
		reason,
	});
};
