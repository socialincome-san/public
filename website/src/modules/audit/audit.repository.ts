import { prisma } from '@/lib/database/prisma';

export const findAuditEvents = async (entityType: string, entityId: string, take: number) =>
	prisma.auditEvent.findMany({
		where: { entityType, entityId },
		orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
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
