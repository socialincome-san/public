import {
	Currency,
	Prisma,
	PrismaClient,
	ProgramPermission,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
} from '@/generated/prisma/client';
import { now } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { ContributionReadService } from '../contribution/contribution-read.service';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
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
	type SubscriptionPaginatedTableView,
	type SubscriptionsDashboardView,
	type SubscriptionTableQuery,
	type SubscriptionTableViewRow,
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
		private readonly programAccessService: ProgramAccessReadService,
		private readonly contributionReadService: ContributionReadService,
		private readonly stripeService: StripeService,
	) {
		super(db);
	}

	private buildSubscriptionOrderBy(query: SubscriptionTableQuery): Prisma.SubscriptionOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'contributor',
			'email',
			'amount',
			'createdAt',
			'status',
			'cancellationReason',
			'paymentMethod',
			'stripeSubscriptionId',
			'bankStandingOrderReference',
		] as const);
		switch (sortBy) {
			case 'contributor':
				return [
					{ contributor: { contact: { firstName: direction } } },
					{ contributor: { contact: { lastName: direction } } },
				];
			case 'email':
				return [{ contributor: { contact: { email: direction } } }];
			case 'amount':
				return [{ amount: direction }];
			case 'createdAt':
				return [{ createdAt: direction }];
			case 'status':
				return [{ status: direction }];
			case 'cancellationReason':
				return [{ cancellationReason: direction }];
			case 'paymentMethod':
				return [{ paymentMethod: direction }];
			case 'stripeSubscriptionId':
				return [{ stripeSubscriptionId: direction }];
			case 'bankStandingOrderReference':
				return [{ bankStandingOrderReference: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: SubscriptionTableQuery,
	): Promise<ServiceResult<SubscriptionPaginatedTableView>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}
			const accessibleProgramIds = Array.from(
				new Set(
					accessibleProgramsResult.data
						.filter((access) => access.permission === ProgramPermission.operator)
						.map((access) => access.programId),
				),
			);
			if (accessibleProgramIds.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0 });
			}

			const search = query.search.trim();
			const selectedStatus = Object.values(SubscriptionStatus).find((status) => status === query.subscriptionStatus);
			const selectedPaymentMethod = Object.values(SubscriptionPaymentMethod).find(
				(method) => method === query.subscriptionPaymentMethod,
			);

			const where: Prisma.SubscriptionWhereInput = {
				campaign: { programId: { in: accessibleProgramIds } },
				...(selectedStatus ? { status: selectedStatus } : {}),
				...(selectedPaymentMethod ? { paymentMethod: selectedPaymentMethod } : {}),
				...(search
					? {
							OR: [
								{ id: { contains: search, mode: 'insensitive' as const } },
								{ contributor: { contact: { firstName: { contains: search, mode: 'insensitive' as const } } } },
								{ contributor: { contact: { lastName: { contains: search, mode: 'insensitive' as const } } } },
								{ contributor: { contact: { email: { contains: search, mode: 'insensitive' as const } } } },
								{ stripeSubscriptionId: { contains: search, mode: 'insensitive' as const } },
								{ bankStandingOrderReference: { contains: search, mode: 'insensitive' as const } },
							],
						}
					: {}),
			};

			const [subscriptions, totalCount] = await Promise.all([
				this.db.subscription.findMany({
					where,
					select: {
						id: true,
						createdAt: true,
						amount: true,
						currency: true,
						status: true,
						cancellationReason: true,
						paymentMethod: true,
						stripeSubscriptionId: true,
						bankStandingOrderReference: true,
						contributor: {
							select: {
								contact: {
									select: {
										firstName: true,
										lastName: true,
										email: true,
									},
								},
							},
						},
					},
					orderBy: this.buildSubscriptionOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.subscription.count({ where }),
			]);

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

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			console.error(error);

			return this.resultFail('Could not fetch subscriptions');
		}
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
			console.error(error);

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
			console.error(error);

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
		console.warn('Skipping upcoming payments for Stripe subscription', {
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
