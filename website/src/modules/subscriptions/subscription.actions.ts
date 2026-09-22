'use server';

import { SubscriptionPaymentMethod } from '@/generated/prisma/enums';
import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import {
	cancelContributorSubscription,
	createManageSubscriptionsSession,
	updateContributorSubscriptionAmount,
} from '@/modules/stripe-payments/stripe-payment.service';
import { cancelSubscriptionSchema, subscriptionIdSchema, updateSubscriptionAmountSchema } from './subscription.schemas';
import { cancelBankTransfer, getOwnedSubscriptionPaymentMethod, updateBankTransferAmount } from './subscription.service';

export const updateSubscriptionAmountAction = async (input: unknown) => {
	const ownership = await resolveOwnedSubscriptionPaymentMethod(input);
	if (!ownership.success) {
		return ownership;
	}

	const parsed = updateSubscriptionAmountSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail(parsed.error.issues[0]?.message ?? 'Invalid subscription amount update');
	}

	const { contributorId, paymentMethod } = ownership.data;
	if (paymentMethod === SubscriptionPaymentMethod.bank_transfer) {
		return updateBankTransferAmount({
			contributorId,
			subscriptionId: parsed.data.subscriptionId,
			amount: parsed.data.amount,
		});
	}

	return updateContributorSubscriptionAmount({
		contributorId,
		subscriptionId: parsed.data.subscriptionId,
		amount: parsed.data.amount,
		coverTransactionCosts: parsed.data.coverTransactionCosts,
	});
};

export const createUpdatePaymentMethodSessionAction = async (input: unknown) => {
	const ownership = await resolveOwnedSubscriptionPaymentMethod(input);
	if (!ownership.success) {
		return ownership;
	}

	const { stripeCustomerId, language, paymentMethod, subscriptionId } = ownership.data;
	if (paymentMethod !== SubscriptionPaymentMethod.stripe) {
		return resultFail('Subscription does not use Stripe');
	}

	return createManageSubscriptionsSession({
		stripeCustomerId,
		language,
		flow: 'payment_method_update',
		subscriptionId,
	});
};

export const cancelSubscriptionAction = async (input: unknown) => {
	const parsed = cancelSubscriptionSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail(parsed.error.issues[0]?.message ?? 'Invalid cancellation reason');
	}

	const ownership = await resolveOwnedSubscriptionPaymentMethod(parsed.data);
	if (!ownership.success) {
		return ownership;
	}

	const { contributorId, paymentMethod } = ownership.data;
	if (paymentMethod === SubscriptionPaymentMethod.bank_transfer) {
		return cancelBankTransfer({
			contributorId,
			subscriptionId: parsed.data.subscriptionId,
			reason: parsed.data.reason,
		});
	}

	return cancelContributorSubscription({
		contributorId,
		subscriptionId: parsed.data.subscriptionId,
		reason: parsed.data.reason,
	});
};

const resolveOwnedSubscriptionPaymentMethod = async (input: unknown) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const parsed = subscriptionIdSchema.safeParse(
		typeof input === 'object' && input !== null && 'subscriptionId' in input ? input.subscriptionId : input,
	);
	if (!parsed.success) {
		return resultFail(parsed.error.issues[0]?.message ?? 'Subscription id is required.');
	}

	const paymentMethodResult = await getOwnedSubscriptionPaymentMethod({
		contributorId: sessionResult.data.id,
		subscriptionId: parsed.data,
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
			subscriptionId: parsed.data,
		},
	};
};
