import type { Prisma } from '@/generated/prisma/client';
import { ContributionStatus, Currency, PaymentEventType } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { ContributionDateRange, ContributionTableQuery, YourContributionsTableQuery } from './contribution.types';

const RECENT_GLOBE_CONTRIBUTION_LIMIT = 200;

export const findSucceededContributionTotal = async (createdAt: ContributionDateRange | undefined) =>
	prisma.contribution.aggregate({
		where: { status: ContributionStatus.succeeded, createdAt },
		_sum: { amountChf: true },
	});

export const findSucceededContributionSummary = async (createdAt: ContributionDateRange) =>
	prisma.contribution.aggregate({
		where: { status: ContributionStatus.succeeded, createdAt },
		_sum: { amountChf: true },
		_count: { _all: true },
	});

export const groupSucceededContributionTotalsBySource = async (createdAt: ContributionDateRange | undefined) =>
	prisma.contribution.groupBy({
		by: ['sourceType'],
		where: { status: ContributionStatus.succeeded, createdAt },
		_sum: { amountChf: true },
	});

export const findSucceededContributionsByContributorCountry = async (createdAt: ContributionDateRange | undefined) =>
	prisma.contribution.findMany({
		where: {
			status: ContributionStatus.succeeded,
			createdAt,
			contributor: { contact: { address: { isNot: null } } },
		},
		select: {
			amountChf: true,
			contributorId: true,
			contributor: {
				select: {
					contact: {
						select: {
							address: {
								select: { country: true },
							},
						},
					},
				},
			},
		},
	});

export const findContribution = async (contributionId: string) =>
	prisma.contribution.findUnique({
		where: { id: contributionId },
		select: {
			id: true,
			amount: true,
			currency: true,
			amountChf: true,
			feesChf: true,
			status: true,
			sourceType: true,
			contributor: {
				select: {
					id: true,
				},
			},
			campaign: {
				select: {
					id: true,
					programId: true,
				},
			},
		},
	});

export const findContributionForUpdate = async (contributionId: string) =>
	prisma.contribution.findUnique({
		where: { id: contributionId },
		select: {
			campaign: { select: { id: true, programId: true } },
			contributor: { select: { id: true } },
		},
	});

// Follow-up: move campaign lookups to a campaigns module once that domain is migrated.
export const findCampaignById = async (campaignId: string) =>
	prisma.campaign.findUnique({
		where: { id: campaignId },
		select: { id: true, programId: true },
	});

// Follow-up: move campaign lookups to a campaigns module once that domain is migrated.
export const findCampaignsByProgramIds = async (programIds: string[]) =>
	prisma.campaign.findMany({
		where: { programId: { in: programIds } },
		select: {
			id: true,
			slug: true,
			programId: true,
			program: { select: { id: true, name: true } },
		},
		orderBy: { slug: 'asc' },
	});

export const findContributionTableSource = async ({
	campaignIds,
	contributorId,
	paymentEventType,
	search,
	campaignIdsMatchingTitle,
	query,
	paginate,
}: {
	campaignIds: string[];
	contributorId: string | undefined;
	paymentEventType: PaymentEventType | undefined;
	search: string;
	campaignIdsMatchingTitle: string[];
	query: ContributionTableQuery;
	paginate: boolean;
}) => {
	const where = buildContributionTableWhere({
		campaignIds,
		contributorId,
		paymentEventType,
		search,
		campaignIdsMatchingTitle,
	});
	const [contributions, totalCount] = await Promise.all([
		prisma.contribution.findMany({
			where,
			select: contributionTableSelect,
			orderBy: buildContributionOrderBy(query),
			...(paginate
				? {
						skip: (query.page - 1) * query.pageSize,
						take: query.pageSize,
					}
				: {}),
		}),
		prisma.contribution.count({ where }),
	]);

	return { contributions, totalCount };
};

export const findSucceededContributionsForContributorAndYear = async (contributorId: string, start: Date, end: Date) =>
	prisma.contribution.findMany({
		where: {
			contributorId,
			AND: [{ createdAt: { gte: start } }, { createdAt: { lte: end } }, { status: ContributionStatus.succeeded }],
		},
		select: {
			contributorId: true,
			amount: true,
			currency: true,
			amountChf: true,
			feesChf: true,
			status: true,
			createdAt: true,
		},
	});

export const findContributorContributionSummary = async (contributorId: string) => {
	const [aggregate, firstContribution] = await Promise.all([
		prisma.contribution.aggregate({
			where: { contributorId, status: ContributionStatus.succeeded },
			_sum: { amountChf: true },
			_count: { _all: true },
		}),
		prisma.contribution.findFirst({
			where: { contributorId, status: ContributionStatus.succeeded },
			orderBy: { createdAt: 'asc' },
			select: { createdAt: true },
		}),
	]);

	return {
		totalAmountChf: aggregate._sum.amountChf,
		count: aggregate._count._all,
		firstContributionAt: firstContribution?.createdAt ?? null,
	};
};

export const findYourContributionTableSource = async ({
	contributorId,
	search,
	matchedCurrency,
	campaignSlugsMatchingTitle,
	query,
	paginate,
}: {
	contributorId: string;
	search: string;
	matchedCurrency: Currency | undefined;
	campaignSlugsMatchingTitle: string[];
	query: YourContributionsTableQuery;
	paginate: boolean;
}) => {
	const where = buildYourContributionTableWhere({
		contributorId,
		search,
		matchedCurrency,
		campaignSlugsMatchingTitle,
	});
	const [contributions, totalCount] = await Promise.all([
		prisma.contribution.findMany({
			where,
			select: yourContributionTableSelect,
			orderBy: buildYourContributionOrderBy(query),
			...(paginate
				? {
						skip: (query.page - 1) * query.pageSize,
						take: query.pageSize,
					}
				: {}),
		}),
		prisma.contribution.count({ where }),
	]);

	return { contributions, totalCount };
};

export const findRecentSuccessfulContributions = async (cutoff: Date) =>
	prisma.contribution.findMany({
		where: {
			status: ContributionStatus.succeeded,
			createdAt: { gte: cutoff },
		},
		select: recentSuccessfulContributionSelect,
		orderBy: { createdAt: 'desc' },
		take: RECENT_GLOBE_CONTRIBUTION_LIMIT,
	});

export const findPaymentEventByTransactionId = async (transactionId: string) =>
	prisma.paymentEvent.findUnique({
		where: { transactionId },
		select: {
			id: true,
			contribution: { select: { id: true, status: true } },
		},
	});

const buildContributionTableWhere = ({
	campaignIds,
	contributorId,
	paymentEventType,
	search,
	campaignIdsMatchingTitle,
}: {
	campaignIds: string[];
	contributorId: string | undefined;
	paymentEventType: PaymentEventType | undefined;
	search: string;
	campaignIdsMatchingTitle: string[];
}): Prisma.ContributionWhereInput => ({
	campaignId: { in: campaignIds },
	...(contributorId ? { contributorId } : {}),
	...(paymentEventType
		? {
				paymentEvent: {
					type: paymentEventType,
				},
			}
		: {}),
	...(search
		? {
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ contributor: { contact: { firstName: { contains: search, mode: 'insensitive' } } } },
					{ contributor: { contact: { lastName: { contains: search, mode: 'insensitive' } } } },
					{ contributor: { contact: { email: { contains: search, mode: 'insensitive' } } } },
					{ campaign: { slug: { contains: search, mode: 'insensitive' } } },
					...(campaignIdsMatchingTitle.length > 0 ? [{ campaignId: { in: campaignIdsMatchingTitle } }] : []),
					{ campaign: { program: { name: { contains: search, mode: 'insensitive' } } } },
				],
			}
		: {}),
});

const buildYourContributionTableWhere = ({
	contributorId,
	search,
	matchedCurrency,
	campaignSlugsMatchingTitle,
}: {
	contributorId: string;
	search: string;
	matchedCurrency: Currency | undefined;
	campaignSlugsMatchingTitle: string[];
}): Prisma.ContributionWhereInput =>
	search
		? {
				AND: [
					{ contributorId },
					{
						OR: [
							{ campaign: { slug: { contains: search, mode: 'insensitive' } } },
							...(campaignSlugsMatchingTitle.length > 0 ? [{ campaign: { slug: { in: campaignSlugsMatchingTitle } } }] : []),
							...(matchedCurrency ? [{ currency: { equals: matchedCurrency } }] : []),
						],
					},
				],
			}
		: { contributorId };

const buildContributionOrderBy = (query: ContributionTableQuery): Prisma.ContributionOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'id',
		'contributor',
		'email',
		'amount',
		'campaignTitle',
		'programName',
		'createdAt',
	] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'contributor':
			return [{ contributor: { contact: { firstName: direction } } }, { contributor: { contact: { lastName: direction } } }];
		case 'email':
			return [{ contributor: { contact: { email: direction } } }];
		case 'amount':
			return [{ amount: direction }];
		case 'campaignTitle':
			return [{ createdAt: 'desc' }];
		case 'programName':
			return [{ campaign: { program: { name: direction } } }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ createdAt: 'desc' }];
	}
};

const buildYourContributionOrderBy = (query: YourContributionsTableQuery): Prisma.ContributionOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'amount',
		'paymentEventType',
		'campaignTitle',
		'createdAt',
		'updatedAt',
		'status',
	] as const);

	switch (sortBy) {
		case 'amount':
			return [{ amount: direction }];
		case 'paymentEventType':
			return [{ paymentEvent: { type: direction } }];
		case 'campaignTitle':
			return [{ updatedAt: 'desc' }];
		case 'createdAt':
			return [{ createdAt: direction }];
		case 'updatedAt':
			return [{ updatedAt: direction }];
		case 'status':
			return [{ status: direction }];
		default:
			return [{ updatedAt: 'desc' }];
	}
};

export const contributionPayloadSelect = {
	id: true,
	amount: true,
	currency: true,
	amountChf: true,
	feesChf: true,
	status: true,
	sourceType: true,
	contributor: { select: { id: true } },
	campaign: { select: { id: true } },
} satisfies Prisma.ContributionSelect;

export const contributionRecordSelect = {
	id: true,
	amount: true,
	currency: true,
	amountChf: true,
	feesChf: true,
	status: true,
	sourceType: true,
	contributorId: true,
	campaignId: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.ContributionSelect;

const contributionTableSelect = {
	id: true,
	createdAt: true,
	amount: true,
	currency: true,
	paymentEvent: { select: { type: true } },
	campaign: {
		select: {
			id: true,
			slug: true,
			program: { select: { id: true, name: true } },
		},
	},
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
} satisfies Prisma.ContributionSelect;

const yourContributionTableSelect = {
	createdAt: true,
	updatedAt: true,
	amount: true,
	currency: true,
	status: true,
	paymentEvent: { select: { type: true } },
	campaign: {
		select: { slug: true },
	},
} satisfies Prisma.ContributionSelect;

const recentSuccessfulContributionSelect = {
	amount: true,
	currency: true,
	createdAt: true,
	contributor: {
		select: {
			contact: {
				select: {
					address: {
						select: { country: true },
					},
				},
			},
		},
	},
} satisfies Prisma.ContributionSelect;

export const paymentEventRecordSelect = {
	id: true,
	type: true,
	transactionId: true,
	contributionId: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.PaymentEventSelect;
