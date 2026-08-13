import { Currency, PrismaClient, SubscriptionPaymentMethod, SubscriptionStatus } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { ContributionReadService } from '../contribution/contribution-read.service';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { StripeService } from '../stripe/stripe.service';
import { type StripeSubscriptionDetails } from '../stripe/stripe.types';
import {
	buildMonthlySchedule,
	mergeUpcomingPayments,
	UPCOMING_PAYMENTS_PER_SUBSCRIPTION,
} from './subscription-payment-schedule';
import {
	type ActiveSubscriptionView,
	type MonthlyContributionSummary,
	type SubscriptionsDashboardView,
	type UpcomingPaymentView,
} from './subscription.types';

type SubscriptionRecord = {
	id: string;
	amount: unknown;
	currency: Currency;
	createdAt: Date;
	paymentMethod: SubscriptionPaymentMethod;
	stripeSubscriptionId: string | null;
	bankStandingOrderReference: string | null;
	contributor: {
		paymentReferenceId: string | null;
	};
};

type EnrichedSubscription = {
	view: ActiveSubscriptionView;
	scheduleAnchor: Date | null;
};

const computeMonthlyContributionSummary = (subscriptions: SubscriptionRecord[]): MonthlyContributionSummary => {
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

export class SubscriptionReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly contributionReadService: ContributionReadService,
		private readonly stripeService: StripeService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async getDashboardView(contributorId: string): Promise<ServiceResult<SubscriptionsDashboardView>> {
		try {
			const [subscriptions, contributionSummaryResult] = await Promise.all([
				this.db.subscription.findMany({
					where: { contributorId, status: SubscriptionStatus.active },
					select: {
						id: true,
						amount: true,
						currency: true,
						createdAt: true,
						paymentMethod: true,
						stripeSubscriptionId: true,
						bankStandingOrderReference: true,
						contributor: {
							select: { paymentReferenceId: true },
						},
					},
					orderBy: { createdAt: 'desc' },
				}),
				this.contributionReadService.getContributorContributionSummary(contributorId),
			]);

			if (!contributionSummaryResult.success) {
				return this.resultFail(contributionSummaryResult.error);
			}

			const referenceNow = now();
			const enrichedSubscriptions = await this.enrichSubscriptions(subscriptions);
			const activeSubscriptions = enrichedSubscriptions.map((subscription) => subscription.view);
			const upcomingPayments = mergeUpcomingPayments(
				enrichedSubscriptions.flatMap((subscription) =>
					this.buildUpcomingPaymentsForSubscription(subscription, referenceNow),
				),
			);

			return this.resultOk({
				activeSubscriptions,
				upcomingPayments,
				monthlyContribution: computeMonthlyContributionSummary(subscriptions),
				contributionSummary: contributionSummaryResult.data,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not fetch subscriptions dashboard');
		}
	}

	async getOwnedSubscriptionPaymentMethod(input: {
		contributorId: string;
		subscriptionId: string;
	}): Promise<ServiceResult<SubscriptionPaymentMethod>> {
		try {
			const subscription = await this.db.subscription.findFirst({
				where: {
					id: input.subscriptionId,
					contributorId: input.contributorId,
				},
				select: { paymentMethod: true },
			});
			if (!subscription) {
				return this.resultFail('Subscription not found');
			}

			return this.resultOk(subscription.paymentMethod);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not load subscription payment method');
		}
	}

	private async enrichSubscriptions(subscriptions: SubscriptionRecord[]): Promise<EnrichedSubscription[]> {
		return Promise.all(subscriptions.map((subscription) => this.enrichSubscription(subscription)));
	}

	private async enrichSubscription(subscription: SubscriptionRecord): Promise<EnrichedSubscription> {
		const viewBase = {
			id: subscription.id,
			amount: Number(subscription.amount),
			currency: subscription.currency,
			createdAt: subscription.createdAt,
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
			return this.stripeSubscriptionWithoutSchedule(subscription, viewBase, 'stripe_details_unavailable');
		}

		const stripeDetails = await this.stripeService.getSubscriptionStripeDetails(subscription.stripeSubscriptionId);
		if (!stripeDetails) {
			return this.stripeSubscriptionWithoutSchedule(subscription, viewBase, 'stripe_details_unavailable');
		}

		if (!stripeDetails.currentPeriodEnd) {
			return {
				view: {
					...viewBase,
					paymentDisplay: this.toStripePaymentDisplay(stripeDetails),
				},
				scheduleAnchor: this.skipStripeSchedule(subscription, 'current_period_end_missing'),
			};
		}

		return {
			view: {
				...viewBase,
				paymentDisplay: this.toStripePaymentDisplay(stripeDetails),
			},
			scheduleAnchor: stripeDetails.currentPeriodEnd,
		};
	}

	private stripeSubscriptionWithoutSchedule(
		subscription: SubscriptionRecord,
		viewBase: Omit<ActiveSubscriptionView, 'paymentDisplay'>,
		reason: 'stripe_details_unavailable',
	): EnrichedSubscription {
		return {
			view: {
				...viewBase,
				paymentDisplay: { type: 'stripe' },
			},
			scheduleAnchor: this.skipStripeSchedule(subscription, reason),
		};
	}

	private skipStripeSchedule(
		subscription: SubscriptionRecord,
		reason: 'stripe_details_unavailable' | 'current_period_end_missing',
	): null {
		this.logger.warn('Skipping upcoming payments for Stripe subscription', {
			subscriptionId: subscription.id,
			stripeSubscriptionId: subscription.stripeSubscriptionId,
			reason,
		});

		return null;
	}

	private toStripePaymentDisplay(stripeDetails: StripeSubscriptionDetails): ActiveSubscriptionView['paymentDisplay'] {
		if (!stripeDetails.brand || !stripeDetails.last4) {
			return { type: 'stripe' };
		}

		return {
			type: 'stripe',
			brand: stripeDetails.brand,
			last4: stripeDetails.last4,
		};
	}

	private buildUpcomingPaymentsForSubscription(
		{ view, scheduleAnchor }: EnrichedSubscription,
		referenceNow: Date,
	): UpcomingPaymentView[] {
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
	}
}
