import { prisma } from '@/lib/database/prisma';
import type { AuditTrailFilter } from './audit.types';

export const findAuditEvents = async ({
	filter,
	cursor,
	take,
}: {
	filter: AuditTrailFilter;
	cursor: string | undefined;
	take: number;
}) =>
	prisma.auditEvent.findMany({
		where: {
			entityType: filter.entityType,
			entityId: filter.entityId,
			actorType: filter.actorType,
			actorId: filter.actorId,
			action: filter.action,
			occurredAt: { gte: filter.from, lte: filter.to },
		},
		orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
		cursor: cursor ? { id: cursor } : undefined,
		skip: cursor ? 1 : 0,
		take,
		select: {
			id: true,
			occurredAt: true,
			actorType: true,
			actorId: true,
			entityType: true,
			entityId: true,
			action: true,
			source: true,
			changes: true,
			metadata: true,
		},
	});
