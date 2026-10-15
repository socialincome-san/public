'use server';

import { SubscriptionPaymentMethod } from '@/generated/prisma/enums';
import { getSessionAuditContext } from '@/lib/audit/audit-context';
import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import {
	cancelContributorSubscription,
	createManageSubscriptionsSession,
	updateContributorSubscriptionAmount,
} from '@/modules/stripe-payments/stripe-payment.service';
import {
	cancelSubscriptionSchema,
	subscriptionIdSchema,
	subscriptionTableQuerySchema,
	updateSubscriptionAmountSchema,
} from './subscription.schemas';
import {
	cancelBankTransfer,
	getOwnedSubscriptionPaymentMethod,
	getPaginatedTableView,
	updateBankTransferAmount,
} from './subscription.service';
import type { SubscriptionPaginatedTableView } from './subscription.types';

export const getSubscriptionTableViewAction = async (query: unknown): Promise<Result<SubscriptionPaginatedTableView>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const queryResult = subscriptionTableQuerySchema.safeParse(query);
	if (!queryResult.success) {
		return resultFail('Invalid table query.');
	}

	return getPaginatedTableView(sessionResult.data.id, queryResult.data);
};

export const updateSubscriptionAmountAction = async (
	input: unknown,
): Promise<Result<{ amount: number; currency: string }>> => {
	const ownership = await resolveOwnedSubscriptionPaymentMethod(input);
	if (!ownership.success) {
		return ownership;
	}

	const parsed = updateSubscriptionAmountSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid subscription amount update');
	}

	const { audit, contributorId, paymentMethod } = ownership.data;
	if (paymentMethod === SubscriptionPaymentMethod.bank_transfer) {
		return updateBankTransferAmount(audit, {
			contributorId,
			subscriptionId: parsed.data.subscriptionId,
			amount: parsed.data.amount,
		});
	}

	return updateContributorSubscriptionAmount(audit, {
		contributorId,
		subscriptionId: parsed.data.subscriptionId,
		amount: parsed.data.amount,
		coverTransactionCosts: parsed.data.coverTransactionCosts,
	});
};

export const createUpdatePaymentMethodSessionAction = async (input: unknown): Promise<Result<string>> => {
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

export const cancelSubscriptionAction = async (input: unknown): Promise<Result<void>> => {
	const parsed = cancelSubscriptionSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid cancellation reason');
	}

	const ownership = await resolveOwnedSubscriptionPaymentMethod(parsed.data);
	if (!ownership.success) {
		return ownership;
	}

	const { audit, contributorId, paymentMethod } = ownership.data;
	if (paymentMethod === SubscriptionPaymentMethod.bank_transfer) {
		return cancelBankTransfer(audit, {
			contributorId,
			subscriptionId: parsed.data.subscriptionId,
			reason: parsed.data.reason,
		});
	}

	return cancelContributorSubscription(audit, {
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
		return resultFail('Subscription id is required.');
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
			audit: getSessionAuditContext(sessionResult.data),
			contributorId: sessionResult.data.id,
			stripeCustomerId: sessionResult.data.stripeCustomerId,
			language: sessionResult.data.language,
			paymentMethod: paymentMethodResult.data,
			subscriptionId: parsed.data,
		},
	};
};
