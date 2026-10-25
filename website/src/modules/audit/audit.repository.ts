import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';

export const findAuditEventPage = async ({
	entityType,
	search,
	paymentPhone,
	contactPhone,
	firstName,
	lastName,
	skip,
	take,
}: {
	entityType?: string;
	search: string;
	paymentPhone?: string;
	contactPhone?: string;
	firstName?: string;
	lastName?: string;
	skip: number;
	take: number;
}) => {
	// A name search lists every event of a matching entity, also those
	// stored under an earlier name or without one, like deletes.
	const namedEntities = search
		? await prisma.auditEvent.findMany({
				where: { entityType, entityName: { contains: search, mode: 'insensitive' } },
				distinct: ['entityType', 'entityId'],
				select: { entityType: true, entityId: true },
			})
		: [];
	const recipientFilters: Prisma.AuditEventWhereInput[] = [];
	if (paymentPhone) {
		recipientFilters.push({
			entityType: 'recipient',
			snapshot: {
				path: ['paymentInformation', 'phone', 'number'],
				string_contains: paymentPhone,
				mode: 'insensitive',
			},
		});
	}
	if (contactPhone) {
		recipientFilters.push({
			entityType: 'recipient',
			snapshot: {
				path: ['contact', 'phone', 'number'],
				string_contains: contactPhone,
				mode: 'insensitive',
			},
		});
	}
	if (firstName) {
		recipientFilters.push({
			entityType: 'recipient',
			snapshot: { path: ['contact', 'firstName'], string_contains: firstName, mode: 'insensitive' },
		});
	}
	if (lastName) {
		recipientFilters.push({
			entityType: 'recipient',
			snapshot: { path: ['contact', 'lastName'], string_contains: lastName, mode: 'insensitive' },
		});
	}
	const where: Prisma.AuditEventWhereInput = {
		entityType,
		// Baselines are only the starting point for diffs, not changes.
		action: { not: 'baseline' },
		...(recipientFilters.length > 0 ? { AND: recipientFilters } : {}),
		OR: search
			? [
					{ entityId: { contains: search, mode: 'insensitive' } },
					{ actorName: { contains: search, mode: 'insensitive' } },
					...namedEntities,
				]
			: undefined,
	};
	const [events, totalCount] = await Promise.all([
		prisma.auditEvent.findMany({
			where,
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
			skip,
			take,
			select: auditEventSelect,
		}),
		prisma.auditEvent.count({ where }),
	]);

	return { events, totalCount };
};

export const findAuditEventHistory = async (entities: { entityType: string; entityId: string }[]) =>
	prisma.auditEvent.findMany({
		where: { OR: entities },
		orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
		select: auditEventSelect,
	});

const auditEventSelect = {
	id: true,
	entityType: true,
	entityId: true,
	entityName: true,
	action: true,
	actorType: true,
	actorName: true,
	source: true,
	snapshot: true,
	createdAt: true,
} satisfies Prisma.AuditEventSelect;
