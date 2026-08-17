'use server';

import { SubscriptionPaymentMethod } from '@/generated/prisma/client';
import { type SubscriptionCancellationReason } from '@/generated/prisma/enums';
import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import { isSubscriptionCancellationReason } from '@/lib/services/subscription/subscription-cancellation';

const resolveOwnedSubscriptionPaymentMethod = async (subscriptionId: string) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const paymentMethodResult = await services.read.subscription.getOwnedSubscriptionPaymentMethod({
		contributorId: sessionResult.data.id,
		subscriptionId,
	});
	if (!paymentMethodResult.success) {
		return paymentMethodResult;
	}

	return {
		success: true as const,
		data: {
			contributorId: sessionResult.data.id,
			stripeCustomerId: sessionResult.data.stripeCustomerId,
			language: sessionResult.data.language,
			paymentMethod: paymentMethodResult.data,
		},
	};
};

export const updateSubscriptionAmountAction = async (subscriptionId: string, amount: number) => {
	const ownership = await resolveOwnedSubscriptionPaymentMethod(subscriptionId);
	if (!ownership.success) {
		return ownership;
	}

	const { contributorId, paymentMethod } = ownership.data;
	if (paymentMethod === SubscriptionPaymentMethod.bank_transfer) {
		return services.write.subscription.updateBankTransferAmount({
			contributorId,
			subscriptionId,
			amount,
		});
	}

	return services.stripe.updateContributorSubscriptionAmount({
		contributorId,
		subscriptionId,
		amount,
	});
};

export const createUpdatePaymentMethodSessionAction = async (subscriptionId: string) => {
	const ownership = await resolveOwnedSubscriptionPaymentMethod(subscriptionId);
	if (!ownership.success) {
		return ownership;
	}

	const { stripeCustomerId, language, paymentMethod } = ownership.data;
	if (paymentMethod !== SubscriptionPaymentMethod.stripe) {
		return { success: false as const, error: 'Subscription does not use Stripe' };
	}

	return services.stripe.createManageSubscriptionsSession({
		stripeCustomerId,
		language,
		flow: 'payment_method_update',
		subscriptionId,
	});
};

export const cancelSubscriptionAction = async (subscriptionId: string, reason: SubscriptionCancellationReason) => {
	if (!isSubscriptionCancellationReason(reason)) {
		return { success: false as const, error: 'Invalid cancellation reason' };
	}

	const ownership = await resolveOwnedSubscriptionPaymentMethod(subscriptionId);
	if (!ownership.success) {
		return ownership;
	}

	const { contributorId, paymentMethod } = ownership.data;
	if (paymentMethod === SubscriptionPaymentMethod.bank_transfer) {
		return services.write.subscription.cancelBankTransfer({
			contributorId,
			subscriptionId,
			reason,
		});
	}

	return services.stripe.cancelContributorSubscription({
		contributorId,
		subscriptionId,
		reason,
	});
};

export const downloadSubscriptionQrBillPdfAction = async (subscriptionId: string) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.qrBill.downloadSubscriptionQrBillPdf({
		contributorId: sessionResult.data.id,
		subscriptionId,
	});
};
