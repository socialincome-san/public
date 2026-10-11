import type { Prisma } from '@/generated/prisma/client';
import { type CountryCode, PayoutStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { CreatePayoutInput, UpdatePayoutInput } from './payout.schemas';
import type {
	OngoingPayoutTableQuery,
	PayoutConfirmationTableQuery,
	PayoutDateRange,
	PayoutProcessCreateInput,
	PayoutTableQuery,
} from './payout.types';

export const findPaidOrConfirmedPayoutTotal = async (paymentAt: PayoutDateRange | undefined) =>
	prisma.payout.aggregate({
		where: {
			status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] },
			paymentAt,
		},
		_sum: { amountChf: true },
	});

export const findPaidPayoutSummary = async (paymentAt: PayoutDateRange) =>
	prisma.payout.aggregate({
		where: {
			status: PayoutStatus.paid,
			paymentAt,
		},
		_sum: { amountChf: true },
		_count: { _all: true },
	});

export const findPayoutTotalForCountry = async (isoCode: CountryCode) =>
	prisma.payout.aggregate({
		where: {
			status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] },
			recipient: { program: { country: { isoCode } } },
		},
		_sum: { amountChf: true },
	});

export const findPayoutTotalForLocalPartner = async (localPartnerId: string) =>
	prisma.payout.aggregate({
		where: {
			status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] },
			recipient: { localPartnerId },
		},
		_sum: { amountChf: true },
	});

export const findPayoutMobileMoneyProviderOptions = async (programIds: string[]) =>
	prisma.mobileMoneyProvider.findMany({
		where: {
			paymentInformations: {
				some: {
					recipients: {
						some: {
							programId: { in: programIds },
							payouts: { some: {} },
						},
					},
				},
			},
		},
		select: { id: true, name: true },
		orderBy: { name: 'asc' },
	});

export const findPayoutTableSource = async ({
	programIds,
	mobileMoneyProviderId,
	status,
	query,
}: {
	programIds: string[];
	mobileMoneyProviderId: string | undefined;
	status: PayoutStatus | undefined;
	query: PayoutTableQuery;
}) => {
	const where = buildPayoutTableWhere(programIds, mobileMoneyProviderId, status, query.search);
	const [payouts, totalCount] = await Promise.all([
		prisma.payout.findMany({
			where,
			select: payoutTableSelect,
			orderBy: buildPayoutOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.payout.count({ where }),
	]);

	return { payouts, totalCount };
};

export const findOngoingPayoutTableSource = async ({
	programIds,
	query,
}: {
	programIds: string[];
	query: OngoingPayoutTableQuery;
}) => {
	const where = buildOngoingPayoutTableWhere(programIds, query.search);
	const [recipients, totalCount] = await Promise.all([
		prisma.recipient.findMany({
			where,
			select: ongoingPayoutTableSelect,
			orderBy: buildOngoingPayoutOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.recipient.count({ where }),
	]);

	return { recipients, totalCount };
};

export const findPayoutConfirmationTableSource = async ({
	programIds,
	query,
}: {
	programIds: string[];
	query: PayoutConfirmationTableQuery;
}) => {
	const where = buildPayoutConfirmationTableWhere(programIds, query.search);
	const [payouts, totalCount] = await Promise.all([
		prisma.payout.findMany({
			where,
			select: payoutConfirmationTableSelect,
			orderBy: { paymentAt: 'desc' },
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.payout.count({ where }),
	]);

	return { payouts, totalCount };
};

export const findPayout = async (payoutId: string) =>
	prisma.payout.findUnique({
		where: { id: payoutId },
		select: payoutPayloadSelect,
	});

export const findPayoutsByRecipientId = async (recipientId: string) =>
	prisma.payout.findMany({
		where: { recipientId },
		select: payoutRecordSelect,
		orderBy: { paymentAt: 'desc' },
	});

export const findPayoutByRecipientAndId = async (recipientId: string, payoutId: string) =>
	prisma.payout.findFirst({
		where: { id: payoutId, recipientId },
		select: payoutRecordSelect,
	});

export const findPayoutForStatusUpdate = async (payoutId: string) =>
	prisma.payout.findUnique({
		where: { id: payoutId },
		select: {
			id: true,
			status: true,
			recipient: { select: { programId: true } },
		},
	});

export const findPayoutForUpdate = async (payoutId: string) =>
	prisma.payout.findUnique({
		where: { id: payoutId },
		select: { recipient: { select: { programId: true } } },
	});

export const findPayoutForDeletion = async (payoutId: string) =>
	prisma.payout.findUnique({
		where: { id: payoutId },
		select: {
			id: true,
			status: true,
			recipient: { select: { programId: true } },
		},
	});

export const findPayoutForRecipientStatusUpdate = async (recipientId: string, payoutId: string) =>
	prisma.payout.findFirst({
		where: { id: payoutId, recipientId },
		select: { id: true },
	});

export const findPayoutProcessRecipientPrograms = async (recipientIds: string[]) =>
	prisma.recipient.findMany({
		where: { id: { in: recipientIds } },
		select: { id: true, programId: true },
	});

export const findExistingPayoutProcessRecipientIds = async (recipientIds: string[], monthStart: Date, monthEnd: Date) =>
	prisma.payout.findMany({
		where: {
			recipientId: { in: recipientIds },
			paymentAt: { gte: monthStart, lte: monthEnd },
		},
		select: { recipientId: true },
	});

export const createPayoutProcessPayouts = async (inputs: PayoutProcessCreateInput[]) =>
	prisma.payout.createMany({
		data: inputs.map(({ recipientId, amount, amountChf, currency, status, paymentAt, phoneNumber }) => ({
			recipientId,
			amount,
			amountChf,
			currency,
			status,
			paymentAt,
			phoneNumber,
			comments: null,
		})),
	});

export const createPayout = async (input: CreatePayoutInput) =>
	prisma.payout.create({
		data: {
			recipientId: input.recipientId,
			amount: input.amount,
			amountChf: input.amountChf,
			currency: input.currency,
			status: input.status,
			paymentAt: input.paymentAt,
			phoneNumber: input.phoneNumber,
			comments: input.comments,
		},
		select: payoutPayloadSelect,
	});

export const updatePayout = async (input: UpdatePayoutInput) =>
	prisma.payout.update({
		where: { id: input.id },
		data: {
			recipientId: input.recipientId,
			amount: input.amount,
			amountChf: input.amountChf,
			currency: input.currency,
			status: input.status,
			paymentAt: input.paymentAt,
			phoneNumber: input.phoneNumber,
			comments: input.comments,
		},
		select: payoutPayloadSelect,
	});

export const updatePayoutStatus = async (payoutId: string, status: PayoutStatus) =>
	prisma.payout.update({
		where: { id: payoutId },
		data: { status },
		select: { id: true },
	});

export const updatePayoutStatusByRecipient = async (
	payoutId: string,
	status: PayoutStatus,
	comments: string | null | undefined,
) =>
	prisma.payout.update({
		where: { id: payoutId },
		data: { status, comments },
		select: payoutRecordSelect,
	});

export const deletePayout = async (payoutId: string) =>
	prisma.payout.delete({
		where: { id: payoutId },
		select: { id: true },
	});

const payoutRecordSelect = {
	id: true,
	legacyFirestoreId: true,
	amount: true,
	amountChf: true,
	currency: true,
	paymentAt: true,
	status: true,
	phoneNumber: true,
	comments: true,
	recipientId: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.PayoutSelect;

const payoutPayloadSelect = {
	id: true,
	amount: true,
	amountChf: true,
	currency: true,
	status: true,
	paymentAt: true,
	phoneNumber: true,
	comments: true,
	recipient: {
		select: {
			id: true,
			contact: { select: { firstName: true, lastName: true } },
			program: { select: { id: true, name: true } },
		},
	},
} satisfies Prisma.PayoutSelect;

const payoutTableSelect = {
	id: true,
	amount: true,
	currency: true,
	status: true,
	paymentAt: true,
	recipient: {
		select: {
			contact: { select: { firstName: true, lastName: true } },
			program: { select: { id: true, name: true } },
			paymentInformation: {
				select: { mobileMoneyProvider: { select: { name: true } } },
			},
		},
	},
} satisfies Prisma.PayoutSelect;

const ongoingPayoutTableSelect = {
	id: true,
	contact: { select: { firstName: true, lastName: true } },
	program: { select: { id: true, name: true, programDurationInMonths: true } },
	payouts: { select: { status: true, paymentAt: true } },
	createdAt: true,
} satisfies Prisma.RecipientSelect;

const payoutConfirmationTableSelect = {
	id: true,
	amount: true,
	currency: true,
	status: true,
	paymentAt: true,
	phoneNumber: true,
	recipient: {
		select: {
			contact: { select: { firstName: true, lastName: true } },
			program: { select: { id: true, name: true } },
		},
	},
} satisfies Prisma.PayoutSelect;

const buildPayoutTableWhere = (
	programIds: string[],
	mobileMoneyProviderId: string | undefined,
	status: PayoutStatus | undefined,
	searchInput: string,
): Prisma.PayoutWhereInput => {
	const search = searchInput.trim();

	return {
		recipient: {
			programId: { in: programIds },
			...(mobileMoneyProviderId ? { paymentInformation: { mobileMoneyProviderId } } : {}),
		},
		...(status ? { status } : {}),
		...(search
			? {
					OR: [
						{ id: { contains: search, mode: 'insensitive' } },
						{ recipient: { id: { contains: search, mode: 'insensitive' } } },
						{ recipient: { contact: { firstName: { contains: search, mode: 'insensitive' } } } },
						{ recipient: { contact: { lastName: { contains: search, mode: 'insensitive' } } } },
						{ recipient: { program: { name: { contains: search, mode: 'insensitive' } } } },
						{
							recipient: {
								paymentInformation: {
									mobileMoneyProvider: { name: { contains: search, mode: 'insensitive' } },
								},
							},
						},
					],
				}
			: {}),
	};
};

const buildOngoingPayoutTableWhere = (programIds: string[], searchInput: string): Prisma.RecipientWhereInput => {
	const search = searchInput.trim();

	return {
		programId: { in: programIds },
		...(search
			? {
					OR: [
						{ id: { contains: search, mode: 'insensitive' } },
						{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
						{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
						{ program: { name: { contains: search, mode: 'insensitive' } } },
					],
				}
			: {}),
	};
};

const buildPayoutConfirmationTableWhere = (programIds: string[], searchInput: string): Prisma.PayoutWhereInput => {
	const search = searchInput.trim();

	return {
		recipient: { programId: { in: programIds } },
		status: PayoutStatus.paid,
		...(search
			? {
					OR: [
						{ id: { contains: search, mode: 'insensitive' } },
						{ recipient: { id: { contains: search, mode: 'insensitive' } } },
						{ recipient: { contact: { firstName: { contains: search, mode: 'insensitive' } } } },
						{ recipient: { contact: { lastName: { contains: search, mode: 'insensitive' } } } },
						{ recipient: { contact: { email: { contains: search, mode: 'insensitive' } } } },
						{ recipient: { program: { name: { contains: search, mode: 'insensitive' } } } },
					],
				}
			: {}),
	};
};

const buildPayoutOrderBy = (query: PayoutTableQuery): Prisma.PayoutOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'id',
		'recipient',
		'programName',
		'mobileMoneyProviderName',
		'amount',
		'status',
		'paymentAt',
	] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'recipient':
			return [{ recipient: { contact: { firstName: direction } } }, { recipient: { contact: { lastName: direction } } }];
		case 'programName':
			return [{ recipient: { program: { name: direction } } }];
		case 'mobileMoneyProviderName':
			return [{ recipient: { paymentInformation: { mobileMoneyProvider: { name: direction } } } }];
		case 'amount':
			return [{ amount: direction }];
		case 'status':
			return [{ status: direction }];
		case 'paymentAt':
			return [{ paymentAt: direction }];
		default:
			return [{ paymentAt: 'desc' }];
	}
};

const buildOngoingPayoutOrderBy = (query: OngoingPayoutTableQuery): Prisma.RecipientOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'recipient', 'programName'] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'recipient':
			return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
		case 'programName':
			return [{ program: { name: direction } }];
		default:
			return [{ createdAt: 'desc' }];
	}
};
