import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import type { AuditContext } from './audit-types';

export type AuditedEntity = {
	type: string;
	findSnapshot: (transaction: Prisma.TransactionClient, id: string) => Promise<Prisma.InputJsonObject | null>;
};

type AuditedWriteOptions = {
	entity: AuditedEntity;
	context: AuditContext;
} & ({ action: 'create' | 'update' } | { action: 'update' | 'delete'; entityId: string | string[] });

/**
 * Runs `write` and stores an audit event per entity with its state afterwards
 * in the same transaction, so the write rolls back if an event cannot be
 * stored. Updates that change nothing store no event. Without `entityId` the
 * ids come from the returned row or rows (`createManyAndReturn`, `RETURNING id`).
 */
export const auditedWrite = async <T>(
	options: AuditedWriteOptions,
	write: (transaction: Prisma.TransactionClient) => Promise<T>,
): Promise<T> =>
	prisma.$transaction(async (transaction) => {
		const result = await write(transaction);
		const entityIds = new Set('entityId' in options ? [options.entityId].flat() : getReturnedIds(result));
		const events: Prisma.AuditEventCreateManyInput[] = [];
		for (const entityId of entityIds) {
			const snapshot = options.action === 'delete' ? null : await options.entity.findSnapshot(transaction, entityId);
			if (options.action === 'update' && !(await hasChanged(transaction, options.entity.type, entityId, snapshot))) {
				continue;
			}

			events.push({
				entityType: options.entity.type,
				entityId,
				action: options.action,
				actorType: options.context.actor.type,
				actorId: options.context.actor.id,
				actorName: options.context.actor.name,
				source: options.context.source,
				snapshot: snapshot ?? undefined,
				metadata: options.context.metadata,
			});
		}
		if (events.length > 0) {
			await transaction.auditEvent.createMany({ data: events });
		}

		return result;
	});

const hasChanged = async (
	transaction: Prisma.TransactionClient,
	entityType: string,
	entityId: string,
	snapshot: Prisma.InputJsonObject | null,
): Promise<boolean> => {
	const latest = await transaction.auditEvent.findFirst({
		where: { entityType, entityId },
		orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
		select: { snapshot: true },
	});

	return !latest || toStableJson(latest.snapshot) !== toStableJson(snapshot);
};

// Postgres reorders jsonb keys, so compare with sorted keys. Dates become
// the same ISO strings the stored snapshot holds.
const toStableJson = (value: unknown): string =>
	JSON.stringify(value, (_key, item: unknown) =>
		item && typeof item === 'object' && !Array.isArray(item)
			? Object.fromEntries(Object.entries(item).sort(([left], [right]) => left.localeCompare(right)))
			: item,
	);

const getReturnedIds = (data: unknown): string[] =>
	(Array.isArray(data) ? data : [data]).map((row: unknown) => {
		if (typeof row === 'object' && row !== null && 'id' in row && typeof row.id === 'string') {
			return row.id;
		}

		throw new Error('An audited write without entityId must return the written rows with their ids.');
	});
