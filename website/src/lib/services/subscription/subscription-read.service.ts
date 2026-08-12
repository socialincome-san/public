import { Currency, PrismaClient, SubscriptionPaymentMethod, SubscriptionStatus } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { ContributionReadService } from '../contribution/contribution-read.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
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
};

type SubscriptionPaymentDisplay = ActiveSubscriptionView['paymentDisplay'];

type EnrichedSubscription = {
	record: SubscriptionRecord;
	view: ActiveSubscriptionView;
	stripeDetails: StripeSubscriptionDetails | null;
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

			return this.resultFail(`Could not fetch subscriptions dashboard for contributor ${contributorId}`);
		}
	}

	private async enrichSubscriptions(subscriptions: SubscriptionRecord[]): Promise<EnrichedSubscription[]> {
		return Promise.all(subscriptions.map((subscription) => this.enrichSubscription(subscription)));
	}

	private async enrichSubscription(subscription: SubscriptionRecord): Promise<EnrichedSubscription> {
		const baseView = {
			id: subscription.id,
			amount: Number(subscription.amount),
			currency: subscription.currency,
			createdAt: subscription.createdAt,
		};

		if (subscription.paymentMethod === SubscriptionPaymentMethod.bank_transfer) {
			return {
				record: subscription,
				view: {
					...baseView,
					paymentDisplay: { type: 'bank_transfer' as const },
				},
				stripeDetails: null,
			};
		}

		if (!subscription.stripeSubscriptionId) {
			return {
				record: subscription,
				view: {
					...baseView,
					paymentDisplay: { type: 'stripe' as const },
				},
				stripeDetails: null,
			};
		}

		const stripeDetails = await this.stripeService.getSubscriptionStripeDetails(subscription.stripeSubscriptionId);
		if (!stripeDetails) {
			return {
				record: subscription,
				view: {
					...baseView,
					paymentDisplay: { type: 'stripe' as const },
				},
				stripeDetails: null,
			};
		}

		const paymentDisplay = this.toStripePaymentDisplay(stripeDetails);

		return {
			record: subscription,
			view: {
				...baseView,
				paymentDisplay,
			},
			stripeDetails,
		};
	}

	private toStripePaymentDisplay(stripeDetails: StripeSubscriptionDetails): SubscriptionPaymentDisplay {
		if (!stripeDetails.brand || !stripeDetails.last4) {
			return { type: 'stripe' as const };
		}

		return {
			type: 'stripe' as const,
			brand: stripeDetails.brand,
			last4: stripeDetails.last4,
		};
	}

	private buildUpcomingPaymentsForSubscription(
		{ record, view, stripeDetails }: EnrichedSubscription,
		referenceNow: Date,
	): UpcomingPaymentView[] {
		const anchor = this.resolveScheduleAnchor(record, stripeDetails);

		return buildMonthlySchedule({
			anchor,
			count: UPCOMING_PAYMENTS_PER_SUBSCRIPTION,
			now: referenceNow,
		}).map((scheduledAt) => ({
			subscriptionId: record.id,
			scheduledAt,
			amount: view.amount,
			currency: view.currency,
			paymentDisplay: view.paymentDisplay,
			status: 'scheduled' as const,
		}));
	}

	private resolveScheduleAnchor(
		record: SubscriptionRecord,
		stripeDetails: StripeSubscriptionDetails | null,
	): Date {
		if (record.paymentMethod === SubscriptionPaymentMethod.bank_transfer) {
			return record.createdAt;
		}

		if (stripeDetails?.currentPeriodEnd) {
			return stripeDetails.currentPeriodEnd;
		}

		this.logger.warn('Using subscription createdAt as schedule anchor for Stripe subscription', {
			subscriptionId: record.id,
			stripeSubscriptionId: record.stripeSubscriptionId,
			reason: stripeDetails === null ? 'stripe_details_unavailable' : 'current_period_end_missing',
		});

		return record.createdAt;
	}
}
