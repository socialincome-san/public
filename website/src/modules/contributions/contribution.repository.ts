import type { Prisma } from '@/generated/prisma/client';
import { ContributionStatus, Currency, PaymentEventType } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { DateTime } from 'luxon';
import type {
	BankTransferUpsertInput,
	ContributionDateRange,
	ContributionTableQuery,
	PaymentEventCreateData,
	StripeContributionCreateData,
	YourContributionsTableQuery,
} from './contribution.types';

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
		where: { programId: { in: programIds }, slug: { not: null } },
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
	paymentEventType,
	search,
	campaignIdsMatchingTitle,
	query,
	paginate,
}: {
	campaignIds: string[];
	paymentEventType: PaymentEventType | undefined;
	search: string;
	campaignIdsMatchingTitle: string[];
	query: ContributionTableQuery;
	paginate: boolean;
}) => {
	const where = buildContributionTableWhere({
		campaignIds,
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

export const createContribution = async (input: {
	amount: number;
	currency: Currency;
	amountChf: number;
	feesChf: number;
	status: ContributionStatus;
	contributorId: string;
	campaignId: string;
}) =>
	prisma.contribution.create({
		data: {
			amount: input.amount,
			currency: input.currency,
			amountChf: input.amountChf,
			feesChf: input.feesChf,
			status: input.status,
			contributorId: input.contributorId,
			campaignId: input.campaignId,
		},
		select: contributionPayloadSelect,
	});

export const updateContribution = async (
	contributionId: string,
	input: {
		amount: number;
		currency: Currency;
		amountChf: number;
		feesChf: number;
		status: ContributionStatus;
		contributorId: string;
		campaignId: string;
	},
) =>
	prisma.contribution.update({
		where: { id: contributionId },
		data: {
			amount: input.amount,
			currency: input.currency,
			amountChf: input.amountChf,
			feesChf: input.feesChf,
			status: input.status,
			contributorId: input.contributorId,
			campaignId: input.campaignId,
		},
		select: contributionPayloadSelect,
	});

export const findPaymentEventByTransactionId = async (transactionId: string) =>
	prisma.paymentEvent.findUnique({
		where: { transactionId },
		select: {
			id: true,
			contribution: { select: { status: true } },
		},
	});

export const updatePaymentEventFromBankTransfer = async (paymentEventId: string, input: BankTransferUpsertInput) =>
	prisma.paymentEvent.update({
		where: { id: paymentEventId },
		data: {
			type: input.type,
			transactionId: input.transactionId,
			metadata: toInputJsonObject(input.metadata),
			contribution: {
				update: {
					amount: input.contribution.amount,
					currency: input.contribution.currency,
					amountChf: input.contribution.amountChf,
					feesChf: input.contribution.feesChf,
					status: input.contribution.status,
					campaignId: input.contribution.campaignId,
					contributorId: input.contribution.contributorId,
				},
			},
		},
		select: paymentEventRecordSelect,
	});

export const createPaymentEventFromBankTransfer = async (input: BankTransferUpsertInput, suffixTransactionId: boolean) =>
	prisma.paymentEvent.create({
		data: {
			type: input.type,
			transactionId: suffixTransactionId
				? `${input.transactionId}-${DateTime.now().toMillis().toString()}`
				: input.transactionId,
			metadata: toInputJsonObject(input.metadata),
			contribution: {
				create: {
					amount: input.contribution.amount,
					currency: input.contribution.currency,
					amountChf: input.contribution.amountChf,
					feesChf: input.contribution.feesChf,
					status: input.contribution.status,
					campaignId: input.contribution.campaignId,
					contributorId: input.contribution.contributorId,
				},
			},
		},
		select: paymentEventRecordSelect,
	});

export const updatePaymentEventFromStripe = async (
	contributionData: StripeContributionCreateData,
	paymentEventData: PaymentEventCreateData,
) =>
	prisma.paymentEvent.upsert({
		where: { transactionId: paymentEventData.transactionId },
		create: {
			type: paymentEventData.type,
			transactionId: paymentEventData.transactionId,
			metadata: toInputJsonObject(paymentEventData.metadata),
			contribution: {
				create: contributionData,
			},
		},
		update: {
			type: paymentEventData.type,
			transactionId: paymentEventData.transactionId,
			metadata: toInputJsonObject(paymentEventData.metadata),
			contribution: {
				update: contributionData,
			},
		},
		select: {
			contribution: {
				select: contributionRecordSelect,
			},
		},
	});

const buildContributionTableWhere = ({
	campaignIds,
	paymentEventType,
	search,
	campaignIdsMatchingTitle,
}: {
	campaignIds: string[];
	paymentEventType: PaymentEventType | undefined;
	search: string;
	campaignIdsMatchingTitle: string[];
}): Prisma.ContributionWhereInput => ({
	campaignId: { in: campaignIds },
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const toInputJsonValue = (value: unknown): Prisma.InputJsonValue | null | undefined => {
	if (value === null) {
		return null;
	}
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return value;
	}
	if (Array.isArray(value)) {
		return value.flatMap((item) => {
			const json = toInputJsonValue(item);

			return json === undefined ? [] : [json];
		});
	}
	if (isRecord(value)) {
		return toInputJsonObject(value);
	}

	return undefined;
};

const toInputJsonObject = (metadata: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined => {
	if (!metadata) {
		return undefined;
	}

	const entries: [string, Prisma.InputJsonValue | null][] = [];
	for (const [key, value] of Object.entries(metadata)) {
		const json = toInputJsonValue(value);
		if (json !== undefined) {
			entries.push([key, json]);
		}
	}

	return Object.fromEntries(entries);
};

const contributionPayloadSelect = {
	id: true,
	amount: true,
	currency: true,
	amountChf: true,
	feesChf: true,
	status: true,
	contributor: { select: { id: true } },
	campaign: { select: { id: true } },
} satisfies Prisma.ContributionSelect;

const contributionRecordSelect = {
	id: true,
	amount: true,
	currency: true,
	amountChf: true,
	feesChf: true,
	status: true,
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

const paymentEventRecordSelect = {
	id: true,
	type: true,
	transactionId: true,
	contributionId: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.PaymentEventSelect;
