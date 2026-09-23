import type { Prisma } from '@/generated/prisma/client';
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

export const createSentEmail = async (input: {
	toEmail: string;
	fromEmail: string;
	subject: string;
	body: string;
	contactId: string | null;
}) =>
	prisma.sentEmail.create({
		data: input,
		select: { id: true },
	});

const buildSentEmailOrderBy = (query: SentEmailTableQuery): Prisma.SentEmailOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'sentAt', 'toEmail', 'subject', 'fromEmail', 'contact'] as const);

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
		case 'contact':
			return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }, { id: direction }];
		default:
			return [{ sentAt: 'desc' }, { id: 'desc' }];
	}
};
