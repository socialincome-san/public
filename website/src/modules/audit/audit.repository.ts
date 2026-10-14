import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';

type EntityScope = { entityType: string; entityIds: string[] };

export const findAuditEventPage = async ({ scopes, skip, take }: { scopes: EntityScope[]; skip: number; take: number }) => {
	const where = scopeWhere(scopes);
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

export const findAuditEventHistory = async (scopes: EntityScope[]) =>
	prisma.auditEvent.findMany({
		where: scopeWhere(scopes),
		orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
		select: auditEventSelect,
	});

const scopeWhere = (scopes: EntityScope[]): Prisma.AuditEventWhereInput => ({
	OR: scopes.map(({ entityType, entityIds }) => ({ entityType, entityId: { in: entityIds } })),
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
