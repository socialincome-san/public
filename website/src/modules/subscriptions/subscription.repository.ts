import type { Prisma } from '@/generated/prisma/client';
import {
	DonationInterval,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
	type SubscriptionCancellationReason,
} from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { SubscriptionTableQuery, UpsertBankStandingOrderInput } from './subscription.types';

export const findSubscriptionTableSource = async ({
	accessibleProgramIds,
	query,
}: {
	accessibleProgramIds: string[];
	query: SubscriptionTableQuery;
}) => {
	const where = buildSubscriptionTableWhere(accessibleProgramIds, query);
	const [subscriptions, totalCount] = await Promise.all([
		prisma.subscription.findMany({
			where,
			select: subscriptionTableSelect,
			orderBy: buildSubscriptionOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.subscription.count({ where }),
	]);

	return { subscriptions, totalCount };
};

export const findActiveSubscriptionsByContributorId = async (contributorId: string) =>
	prisma.subscription.findMany({
		where: { contributorId, status: SubscriptionStatus.active },
		select: dashboardSubscriptionSelect,
		orderBy: { createdAt: 'desc' },
	});

export const findOwnedSubscriptionPaymentMethod = async (contributorId: string, subscriptionId: string) =>
	prisma.subscription.findFirst({
		where: {
			id: subscriptionId,
			contributorId,
		},
		select: { paymentMethod: true },
	});

export const findOwnedActiveBankTransferSubscription = async (contributorId: string, subscriptionId: string) =>
	prisma.subscription.findFirst({
		where: {
			id: subscriptionId,
			contributorId,
			paymentMethod: SubscriptionPaymentMethod.bank_transfer,
			status: SubscriptionStatus.active,
		},
		select: { id: true, currency: true },
	});

export const findOwnedBankTransferSubscription = async (contributorId: string, subscriptionId: string) =>
	prisma.subscription.findFirst({
		where: {
			id: subscriptionId,
			contributorId,
			paymentMethod: SubscriptionPaymentMethod.bank_transfer,
		},
		select: { id: true, status: true },
	});

export const updateBankStandingOrder = async (input: UpsertBankStandingOrderInput) => {
	const status = input.status ?? SubscriptionStatus.active;
	const canceledAt = input.canceledAt ?? null;
	const sharedFields = {
		contributorId: input.contributorId,
		campaignId: input.campaignId,
		amount: input.amount,
		currency: input.currency,
		interval: DonationInterval.monthly,
		status,
		paymentMethod: SubscriptionPaymentMethod.bank_transfer,
		canceledAt,
		coverTransactionCosts: false,
	};

	return prisma.subscription.upsert({
		where: { bankStandingOrderReference: input.bankStandingOrderReference },
		create: {
			bankStandingOrderReference: input.bankStandingOrderReference,
			...sharedFields,
		},
		update: sharedFields,
		select: subscriptionUpsertSelect,
	});
};

export const updateBankTransferSubscriptionAmount = async (subscriptionId: string, amount: number) =>
	prisma.subscription.update({
		where: { id: subscriptionId },
		data: { amount },
		select: { id: true },
	});

export const updateBankTransferSubscriptionCancellation = async (input: {
	subscriptionId: string;
	reason: SubscriptionCancellationReason;
	canceledAt: Date;
}) =>
	prisma.subscription.update({
		where: { id: input.subscriptionId },
		data: {
			status: SubscriptionStatus.ended,
			canceledAt: input.canceledAt,
			cancellationReason: input.reason,
		},
		select: { id: true },
	});

const buildSubscriptionTableWhere = (
	accessibleProgramIds: string[],
	query: SubscriptionTableQuery,
): Prisma.SubscriptionWhereInput => {
	const search = query.search.trim();
	const selectedStatus = Object.values(SubscriptionStatus).find((status) => status === query.subscriptionStatus);
	const selectedPaymentMethod = Object.values(SubscriptionPaymentMethod).find(
		(method) => method === query.subscriptionPaymentMethod,
	);

	return {
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
};

const buildSubscriptionOrderBy = (query: SubscriptionTableQuery): Prisma.SubscriptionOrderByWithRelationInput[] => {
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
			return [{ contributor: { contact: { firstName: direction } } }, { contributor: { contact: { lastName: direction } } }];
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
};

const subscriptionTableSelect = {
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
} satisfies Prisma.SubscriptionSelect;

const dashboardSubscriptionSelect = {
	id: true,
	amount: true,
	currency: true,
	createdAt: true,
	coverTransactionCosts: true,
	paymentMethod: true,
	stripeSubscriptionId: true,
	bankStandingOrderReference: true,
	contributor: {
		select: { paymentReferenceId: true },
	},
} satisfies Prisma.SubscriptionSelect;

const subscriptionUpsertSelect = {
	id: true,
	stripeSubscriptionId: true,
	bankStandingOrderReference: true,
	campaignId: true,
	status: true,
} satisfies Prisma.SubscriptionSelect;
