import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';

type EntityScope = { entityType: string; entityIds: string[] };

export const findVersionPage = async ({ scopes, skip, take }: { scopes: EntityScope[]; skip: number; take: number }) => {
	const where = scopeWhere(scopes);
	const [versions, totalCount] = await Promise.all([
		prisma.entityVersion.findMany({
			where,
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
			skip,
			take,
			select: versionSelect,
		}),
		prisma.entityVersion.count({ where }),
	]);

	return { versions, totalCount };
};

export const findVersionHistory = async (scopes: EntityScope[]) =>
	prisma.entityVersion.findMany({
		where: scopeWhere(scopes),
		orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
		select: versionSelect,
	});

const scopeWhere = (scopes: EntityScope[]): Prisma.EntityVersionWhereInput => ({
	OR: scopes.map(({ entityType, entityIds }) => ({ entityType, entityId: { in: entityIds } })),
});

const versionSelect = {
	id: true,
	entityType: true,
	entityId: true,
	action: true,
	actorType: true,
	actorName: true,
	source: true,
	snapshot: true,
	createdAt: true,
} satisfies Prisma.EntityVersionSelect;
