import type { Prisma } from '@/generated/prisma/client';
import type { SentEmailStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { SentEmailTableQuery } from './mail.types';

export const findContactIdByEmail = async (email: string) =>
	prisma.contact.findUnique({
		where: { email },
		select: { id: true },
	});

export const findPaginatedSentEmails = async (query: SentEmailTableQuery) => {
	const search = query.search.trim();
	const where: Prisma.SentEmailWhereInput | undefined = search
		? {
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ toEmail: { contains: search, mode: 'insensitive' } },
					{ fromEmail: { contains: search, mode: 'insensitive' } },
					{ type: { contains: search, mode: 'insensitive' } },
					{ subject: { contains: search, mode: 'insensitive' } },
					{ body: { contains: search, mode: 'insensitive' } },
					{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
					{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
					{ contact: { email: { contains: search, mode: 'insensitive' } } },
				],
			}
		: undefined;

	const [sentEmails, totalCount] = await Promise.all([
		prisma.sentEmail.findMany({
			where,
			select: {
				id: true,
				sentAt: true,
				toEmail: true,
				fromEmail: true,
				subject: true,
				body: true,
				type: true,
				status: true,
				errorMessage: true,
				contact: {
					select: {
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
			orderBy: buildSentEmailOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.sentEmail.count({ where }),
	]);

	return { sentEmails, totalCount };
};

export const findSentEmailByIdempotencyKey = async (idempotencyKey: string) =>
	prisma.sentEmail.findUnique({
		where: { idempotencyKey },
		select: { id: true, status: true },
	});

export const createSentEmail = async (data: {
	toEmail: string;
	fromEmail: string;
	subject: string;
	body: string;
	contactId: string | null;
	type: string;
	status: SentEmailStatus;
	idempotencyKey: string | null;
	campaignId: string | null;
}): Promise<{ kind: 'created'; id: string } | { kind: 'duplicate' }> => {
	try {
		const sentEmail = await prisma.sentEmail.create({ data, select: { id: true } });

		return { kind: 'created', id: sentEmail.id };
	} catch (error) {
		if (isUniqueConstraintError(error)) {
			return { kind: 'duplicate' };
		}

		throw error;
	}
};

export const updateSentEmail = async (
	id: string,
	data: {
		status: SentEmailStatus;
		providerMessageId?: string | null;
		errorMessage: string | null;
		sentAt?: Date;
		statusUpdatedAt: Date;
	},
) =>
	prisma.sentEmail.update({
		where: { id },
		data,
		select: { id: true },
	});

export const updateSentEmailStatusIfIn = async (
	id: string,
	currentStatuses: SentEmailStatus[],
	data: { status: SentEmailStatus; errorMessage: string | null; statusUpdatedAt: Date },
) =>
	prisma.sentEmail.updateMany({
		where: { id, status: { in: currentStatuses } },
		data,
	});

const buildSentEmailOrderBy = (query: SentEmailTableQuery): Prisma.SentEmailOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'id',
		'sentAt',
		'toEmail',
		'subject',
		'fromEmail',
		'type',
		'status',
		'contact',
	] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'sentAt':
			return [{ sentAt: direction }, { id: direction }];
		case 'toEmail':
			return [{ toEmail: direction }, { id: direction }];
		case 'subject':
			return [{ subject: direction }, { id: direction }];
		case 'fromEmail':
			return [{ fromEmail: direction }, { id: direction }];
		case 'type':
			return [{ type: direction }, { id: direction }];
		case 'status':
			return [{ status: direction }, { id: direction }];
		case 'contact':
			return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }, { id: direction }];
		default:
			return [{ sentAt: 'desc' }, { id: 'desc' }];
	}
};

const isUniqueConstraintError = (error: unknown): boolean =>
	typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
