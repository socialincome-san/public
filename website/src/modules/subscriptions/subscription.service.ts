import {
	ProgramPermission,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
	type SubscriptionCancellationReason,
} from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { now } from '@/lib/utils/now';
import { getContributorContributionSummary } from '@/modules/contributions/contribution.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';
import { getSubscriptionStripeDetails } from '@/modules/stripe-payments/stripe-payment.service';
import type { StripeSubscriptionDetails } from '@/modules/stripe-payments/stripe-payment.types';
import { subscriptionAmount } from './subscription-amount.service';
import { subscriptionPaymentSchedule } from './subscription-payment-schedule.service';
import { canListSubscriptions } from './subscription.permissions';
import * as subscriptionRepository from './subscription.repository';
import type {
	ActiveSubscriptionView,
	MonthlyContributionSummary,
	OwnedBankTransferQrBill,
	SubscriptionPaginatedTableView,
	SubscriptionsDashboardView,
	SubscriptionTableQuery,
	SubscriptionTableViewRow,
	SubscriptionUpsertResult,
	UpcomingPaymentView,
	UpsertBankStandingOrderInput,
} from './subscription.types';
import { UPCOMING_PAYMENTS_PER_SUBSCRIPTION } from './subscription.types';

const { buildMonthly: buildMonthlySchedule, mergeUpcoming: mergeUpcomingPayments } = subscriptionPaymentSchedule;

type DashboardSubscriptionRecord = Awaited<
	ReturnType<typeof subscriptionRepository.findActiveSubscriptionsByContributorId>
>[number];

type EnrichedSubscription = {
	view: ActiveSubscriptionView;
	scheduleAnchor: Date | null;
};

export const getPaginatedTableView = async (
	userId: string,
	query: SubscriptionTableQuery,
): Promise<ServiceResult<SubscriptionPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canListSubscriptions(accessResult.data)) {
			return resultOk({ tableRows: [], totalCount: 0 });
		}

		const accessibleProgramIds = uniqueOperatorProgramIds(accessResult.data);
		if (accessibleProgramIds.length === 0) {
			return resultOk({ tableRows: [], totalCount: 0 });
		}

		const { subscriptions, totalCount } = await subscriptionRepository.findSubscriptionTableSource({
			accessibleProgramIds,
			query,
		});
		const tableRows: SubscriptionTableViewRow[] = subscriptions.map((subscription) => ({
			id: subscription.id,
			firstName: subscription.contributor?.contact?.firstName ?? '',
			lastName: subscription.contributor?.contact?.lastName ?? '',
			email: subscription.contributor?.contact?.email ?? '',
			amount: Number(subscription.amount),
			currency: subscription.currency,
			status: subscription.status,
			cancellationReason: subscription.cancellationReason,
			paymentMethod: subscription.paymentMethod,
			stripeSubscriptionId: subscription.stripeSubscriptionId,
			bankStandingOrderReference: subscription.bankStandingOrderReference,
			createdAt: subscription.createdAt,
		}));

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch subscriptions');
	}
};

export const getDashboardView = async (contributorId: string): Promise<ServiceResult<SubscriptionsDashboardView>> => {
	try {
		const [subscriptions, contributionSummaryResult] = await Promise.all([
			subscriptionRepository.findActiveSubscriptionsByContributorId(contributorId),
			getContributorContributionSummary(contributorId),
		]);
		if (!contributionSummaryResult.success) {
			return resultFail(contributionSummaryResult.error);
		}

		const referenceNow = now();
		const enrichedSubscriptions = await Promise.all(subscriptions.map((subscription) => enrichSubscription(subscription)));

		return resultOk({
			activeSubscriptions: enrichedSubscriptions.map((subscription) => subscription.view),
			upcomingPayments: mergeUpcomingPayments(
				enrichedSubscriptions.flatMap((subscription) => buildUpcomingPaymentsForSubscription(subscription, referenceNow)),
			),
			monthlyContribution: computeMonthlyContributionSummary(subscriptions),
			contributionSummary: contributionSummaryResult.data,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch subscriptions dashboard');
	}
};

export const getOwnedSubscriptionPaymentMethod = async (input: {
	contributorId: string;
	subscriptionId: string;
}): Promise<ServiceResult<SubscriptionPaymentMethod>> => {
	try {
		const subscription = await subscriptionRepository.findOwnedSubscriptionPaymentMethod(
			input.contributorId,
			input.subscriptionId,
		);
		if (!subscription) {
			return resultFail('Subscription not found');
		}

		return resultOk(subscription.paymentMethod);
	} catch (error) {
		console.error(error);

		return resultFail('Could not load subscription payment method');
	}
};

export const getOwnedActiveBankTransferQrBill = async (input: {
	contributorId: string;
	subscriptionId: string;
}): Promise<ServiceResult<OwnedBankTransferQrBill>> => {
	try {
		const subscription = await subscriptionRepository.findOwnedActiveBankTransferQrBill(
			input.contributorId,
			input.subscriptionId,
		);
		if (!subscription) {
			return resultFail('Bank transfer subscription not found');
		}

		const contributorReferenceId = subscription.contributor.paymentReferenceId;
		const contributionReferenceId = subscription.bankStandingOrderReference;
		if (!contributorReferenceId || !contributionReferenceId) {
			return resultFail('QR bill references are missing for this subscription');
		}

		const amount = Number(subscription.amount);
		if (!Number.isFinite(amount) || amount <= 0) {
			return resultFail('Invalid QR bill amount');
		}

		return resultOk({
			amount,
			currency: subscription.currency,
			contributorReferenceId,
			contributionReferenceId,
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not load bank transfer subscription');
	}
};

export const upsertFromBankStandingOrder = async (
	input: UpsertBankStandingOrderInput,
): Promise<ServiceResult<SubscriptionUpsertResult>> => {
	try {
		const subscription = await subscriptionRepository.updateBankStandingOrder(input);

		return resultOk(subscription);
	} catch (error) {
		console.error(error);

		return resultFail('Could not upsert bank standing-order subscription');
	}
};

export const updateBankTransferAmount = async (input: {
	contributorId: string;
	subscriptionId: string;
	amount: number;
}): Promise<ServiceResult<{ amount: number; currency: string }>> => {
	try {
		if (!subscriptionAmount.isSubscriptionAmountInRange(input.amount)) {
			return resultFail('Amount must be an integer between 1 and 1000000');
		}

		const subscription = await subscriptionRepository.findOwnedActiveBankTransferSubscription(
			input.contributorId,
			input.subscriptionId,
		);
		if (!subscription) {
			return resultFail('Subscription not found');
		}

		await subscriptionRepository.updateBankTransferSubscriptionAmount(subscription.id, input.amount);

		return resultOk({ amount: input.amount, currency: subscription.currency });
	} catch (error) {
		console.error(error);

		return resultFail('Could not update subscription amount');
	}
};

export const cancelBankTransfer = async (input: {
	contributorId: string;
	subscriptionId: string;
	reason: SubscriptionCancellationReason;
}): Promise<ServiceResult<void>> => {
	try {
		const subscription = await subscriptionRepository.findOwnedBankTransferSubscription(
			input.contributorId,
			input.subscriptionId,
		);
		if (!subscription || subscription.status === SubscriptionStatus.ended) {
			return resultFail('Subscription not found');
		}

		await subscriptionRepository.updateBankTransferSubscriptionCancellation({
			subscriptionId: subscription.id,
			reason: input.reason,
			canceledAt: now(),
		});

		return resultOk(undefined);
	} catch (error) {
		console.error(error);

		return resultFail('Could not cancel subscription');
	}
};

const uniqueOperatorProgramIds = (accessiblePrograms: ProgramAccesses): string[] =>
	Array.from(
		new Set(
			accessiblePrograms
				.filter((access) => access.permission === ProgramPermission.operator)
				.map((access) => access.programId),
		),
	);

const computeMonthlyContributionSummary = (subscriptions: DashboardSubscriptionRecord[]): MonthlyContributionSummary => {
	if (subscriptions.length === 0) {
		return { totalAmount: null, currency: null, activeCount: 0 };
	}

	const currencies = new Set(subscriptions.map((subscription) => subscription.currency));
	if (currencies.size > 1) {
		return { totalAmount: null, currency: null, activeCount: subscriptions.length };
	}

	const totalAmount = subscriptions.reduce((sum, subscription) => sum + Number(subscription.amount), 0);

	return {
		totalAmount,
		currency: subscriptions[0]?.currency ?? null,
		activeCount: subscriptions.length,
	};
};

const enrichSubscription = async (subscription: DashboardSubscriptionRecord): Promise<EnrichedSubscription> => {
	const viewBase = {
		id: subscription.id,
		amount: Number(subscription.amount),
		currency: subscription.currency,
		createdAt: subscription.createdAt,
		coverTransactionCosts: subscription.coverTransactionCosts,
	};

	if (subscription.paymentMethod === SubscriptionPaymentMethod.bank_transfer) {
		const contributorReferenceId = subscription.contributor.paymentReferenceId;
		const contributionReferenceId = subscription.bankStandingOrderReference;
		const qrBill =
			contributorReferenceId &&
			contributionReferenceId &&
			(subscription.currency === 'CHF' || subscription.currency === 'EUR')
				? { contributorReferenceId, contributionReferenceId }
				: null;

		return {
			view: {
				...viewBase,
				paymentDisplay: { type: 'bank_transfer', qrBill },
			},
			scheduleAnchor: subscription.createdAt,
		};
	}

	if (!subscription.stripeSubscriptionId) {
		return stripeSubscriptionWithoutSchedule(subscription, viewBase, 'stripe_details_unavailable');
	}

	const stripeDetailsResult = await getSubscriptionStripeDetails(subscription.stripeSubscriptionId);
	if (!stripeDetailsResult.success || !stripeDetailsResult.data) {
		return stripeSubscriptionWithoutSchedule(subscription, viewBase, 'stripe_details_unavailable');
	}

	const stripeDetails = stripeDetailsResult.data;
	if (!stripeDetails.currentPeriodEnd) {
		return {
			view: {
				...viewBase,
				paymentDisplay: toStripePaymentDisplay(stripeDetails),
			},
			scheduleAnchor: skipStripeSchedule(subscription, 'current_period_end_missing'),
		};
	}

	return {
		view: {
			...viewBase,
			paymentDisplay: toStripePaymentDisplay(stripeDetails),
		},
		scheduleAnchor: stripeDetails.currentPeriodEnd,
	};
};

const stripeSubscriptionWithoutSchedule = (
	subscription: DashboardSubscriptionRecord,
	viewBase: Omit<ActiveSubscriptionView, 'paymentDisplay'>,
	reason: 'stripe_details_unavailable',
): EnrichedSubscription => ({
	view: {
		...viewBase,
		paymentDisplay: { type: 'stripe' },
	},
	scheduleAnchor: skipStripeSchedule(subscription, reason),
});

const skipStripeSchedule = (
	subscription: DashboardSubscriptionRecord,
	reason: 'stripe_details_unavailable' | 'current_period_end_missing',
): null => {
	console.warn('Skipping upcoming payments for Stripe subscription', {
		subscriptionId: subscription.id,
		stripeSubscriptionId: subscription.stripeSubscriptionId,
		reason,
	});

	return null;
};

const toStripePaymentDisplay = (stripeDetails: StripeSubscriptionDetails): ActiveSubscriptionView['paymentDisplay'] => {
	if (!stripeDetails.brand || !stripeDetails.last4) {
		return { type: 'stripe' };
	}

	return {
		type: 'stripe',
		brand: stripeDetails.brand,
		last4: stripeDetails.last4,
	};
};

const buildUpcomingPaymentsForSubscription = (
	{ view, scheduleAnchor }: EnrichedSubscription,
	referenceNow: Date,
): UpcomingPaymentView[] => {
	if (!scheduleAnchor) {
		return [];
	}

	return buildMonthlySchedule({
		anchor: scheduleAnchor,
		count: UPCOMING_PAYMENTS_PER_SUBSCRIPTION,
		now: referenceNow,
	}).map((scheduledAt) => ({
		subscriptionId: view.id,
		scheduledAt,
		amount: view.amount,
		currency: view.currency,
		paymentDisplay: view.paymentDisplay,
		status: 'scheduled',
	}));
};
