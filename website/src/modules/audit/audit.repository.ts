import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';

export const findAuditEventPage = async ({
	entityType,
	search,
	skip,
	take,
}: {
	entityType?: string;
	search: string;
	skip: number;
	take: number;
}) => {
	const where: Prisma.AuditEventWhereInput = {
		entityType,
		OR: search
			? [{ entityId: { contains: search, mode: 'insensitive' } }, { actorName: { contains: search, mode: 'insensitive' } }]
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
	action: true,
	actorType: true,
	actorName: true,
	source: true,
	snapshot: true,
	createdAt: true,
} satisfies Prisma.AuditEventSelect;
