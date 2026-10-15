import {
	ProgramPermission,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
	type SubscriptionCancellationReason,
} from '@/generated/prisma/enums';
import type { AuditContext } from '@/lib/audit/audit-types';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { now } from '@/lib/utils/now';
import { getCampaignFilterOption } from '@/modules/campaigns/campaign.service';
import { getContributorContributionSummary } from '@/modules/contributions/contribution.service';
import { getContributorFilterOption } from '@/modules/contributors/contributor.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';
import { getSubscriptionStripeDetails } from '@/modules/stripe-payments/stripe-payment.service';
import type { StripeSubscriptionDetails } from '@/modules/stripe-payments/stripe-payment.types';
import { subscriptionAmount } from './subscription-amount.service';
import { subscriptionPaymentSchedule } from './subscription-payment-schedule.service';
import { canListSubscriptions } from './subscription.permissions';
import * as subscriptionRepository from './subscription.repository.read';
import * as subscriptionWriteRepository from './subscription.repository.write';
import type {
	ActiveSubscriptionView,
	MonthlyContributionSummary,
	OwnedBankTransferQrBill,
	StripeSubscriptionInput,
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

export const isBankStandingOrderReferenceTaken = async (reference: string): Promise<Result<boolean>> => {
	try {
		const existing = await subscriptionRepository.findBankStandingOrderByReference(reference);

		return resultOk(Boolean(existing));
	} catch (error) {
		console.error('Could not check standing order reference', { error });

		return resultFail('Could not check standing order reference');
	}
};

export const getPaginatedTableView = async (
	userId: string,
	query: SubscriptionTableQuery,
): Promise<Result<SubscriptionPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canListSubscriptions(accessResult.data)) {
			return resultOk({ tableRows: [], totalCount: 0, contributorFilterOptions: [], campaignFilterOptions: [] });
		}

		const accessibleProgramIds = uniqueOperatorProgramIds(accessResult.data);
		if (accessibleProgramIds.length === 0) {
			return resultOk({ tableRows: [], totalCount: 0, contributorFilterOptions: [], campaignFilterOptions: [] });
		}

		const requestedContributorId = query.contributorId?.trim();
		const requestedCampaignId = query.campaignId?.trim();
		// Unknown or inaccessible records are ignored, so a filter never hides rows behind an invisible value
		const [contributorOptionResult, campaignOptionResult] = await Promise.all([
			requestedContributorId ? getContributorFilterOption(requestedContributorId, accessibleProgramIds) : resultOk(null),
			requestedCampaignId ? getCampaignFilterOption(requestedCampaignId, accessibleProgramIds) : resultOk(null),
		]);
		if (!contributorOptionResult.success) {
			return resultFail(contributorOptionResult.error);
		}
		if (!campaignOptionResult.success) {
			return resultFail(campaignOptionResult.error);
		}
		const contributorOption = contributorOptionResult.data;
		const campaignOption = campaignOptionResult.data;

		const { subscriptions, totalCount } = await subscriptionRepository.findSubscriptionTableSource({
			accessibleProgramIds,
			contributorId: contributorOption?.id,
			campaignId: campaignOption?.id,
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

		return resultOk({
			tableRows,
			totalCount,
			contributorFilterOptions: contributorOption ? [contributorOption] : [],
			campaignFilterOptions: campaignOption ? [campaignOption] : [],
		});
	} catch (error) {
		console.error(error);

		return resultFail('Could not fetch subscriptions');
	}
};

export const getDashboardView = async (contributorId: string): Promise<Result<SubscriptionsDashboardView>> => {
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
}): Promise<Result<SubscriptionPaymentMethod>> => {
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
}): Promise<Result<OwnedBankTransferQrBill>> => {
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
	audit: AuditContext,
	input: UpsertBankStandingOrderInput,
): Promise<Result<SubscriptionUpsertResult>> => {
	try {
		const existing = await subscriptionRepository.findBankStandingOrderByReference(input.bankStandingOrderReference);
		if (existing && existing.contributorId !== input.contributorId) {
			return resultFail('Standing order reference is already in use');
		}

		const subscription = existing
			? await subscriptionWriteRepository.updateBankStandingOrder(audit, existing.id, input)
			: await subscriptionWriteRepository.createBankStandingOrder(audit, input);

		return resultOk(subscription);
	} catch (error) {
		console.error(error);

		return resultFail('Could not upsert bank standing-order subscription');
	}
};

export const updateBankTransferAmount = async (
	audit: AuditContext,
	input: {
		contributorId: string;
		subscriptionId: string;
		amount: number;
	},
): Promise<Result<{ amount: number; currency: string }>> => {
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

		await subscriptionWriteRepository.updateSubscriptionAmount(audit, subscription.id, input.amount);

		return resultOk({ amount: input.amount, currency: subscription.currency });
	} catch (error) {
		console.error(error);

		return resultFail('Could not update subscription amount');
	}
};

export const cancelBankTransfer = async (
	audit: AuditContext,
	input: {
		contributorId: string;
		subscriptionId: string;
		reason: SubscriptionCancellationReason;
	},
): Promise<Result<void>> => {
	try {
		const subscription = await subscriptionRepository.findOwnedBankTransferSubscription(
			input.contributorId,
			input.subscriptionId,
		);
		if (!subscription || subscription.status === SubscriptionStatus.ended) {
			return resultFail('Subscription not found');
		}

		await subscriptionWriteRepository.updateSubscriptionLifecycle(audit, {
			subscriptionId: subscription.id,
			status: SubscriptionStatus.ended,
			canceledAt: now(),
			cancellationReason: input.reason,
		});

		return resultOk(undefined);
	} catch (error) {
		console.error(error);

		return resultFail('Could not cancel subscription');
	}
};

/** Creates or updates the subscription of a Stripe subscription. */
export const syncStripeSubscription = async (
	audit: AuditContext,
	input: StripeSubscriptionInput,
): Promise<Result<{ id: string }>> => {
	try {
		const existing = await subscriptionRepository.findSubscriptionIdByStripeId(input.stripeSubscriptionId);

		return resultOk(
			existing
				? await subscriptionWriteRepository.updateStripeSubscription(audit, existing.id, input)
				: await subscriptionWriteRepository.createStripeSubscription(audit, input),
		);
	} catch (error) {
		console.error(error);

		return resultFail('Could not sync Stripe subscription');
	}
};

/** Status changes of a subscription, e.g. from Stripe or a cancellation. The caller authorizes. */
export const updateSubscriptionLifecycle = async (
	audit: AuditContext,
	input: {
		subscriptionId: string;
		status: SubscriptionStatus;
		canceledAt: Date | null;
		cancellationReason?: SubscriptionCancellationReason;
	},
): Promise<Result<{ id: string }>> => {
	try {
		return resultOk(await subscriptionWriteRepository.updateSubscriptionLifecycle(audit, input));
	} catch (error) {
		console.error(error);

		return resultFail('Could not update subscription status');
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
