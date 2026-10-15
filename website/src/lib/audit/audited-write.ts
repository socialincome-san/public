import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import type { AuditContext } from './audit-types';

export type AuditedEntity<Snapshot extends Prisma.InputJsonObject = Prisma.InputJsonObject> = {
	type: string;
	findSnapshot: (transaction: Prisma.TransactionClient, id: string) => Promise<Snapshot | null>;
	/** Stored with every event, so the audit log can show and search an entity, also once it is deleted. */
	getName: (snapshot: Snapshot) => string | null;
};

/** Infers the snapshot type from `findSnapshot`, so `getName` can read it. */
export const defineAuditedEntity = <Snapshot extends Prisma.InputJsonObject>(
	entity: AuditedEntity<Snapshot>,
): AuditedEntity<Snapshot> => entity;

type AuditedWriteOptions<Snapshot extends Prisma.InputJsonObject> = {
	entity: AuditedEntity<Snapshot>;
	context: AuditContext;
} & ({ action: 'create' | 'update' } | { action: 'update' | 'delete'; entityId: string | string[] });

/**
 * Runs `write` and stores an audit event per entity with its state afterwards
 * in the same transaction, so the write rolls back if an event cannot be
 * stored. Updates that change nothing store no event. Without `entityId` the
 * ids come from the returned row or rows (`createManyAndReturn`, `updateManyAndReturn`).
 */
export const auditedWrite = async <T, Snapshot extends Prisma.InputJsonObject>(
	options: AuditedWriteOptions<Snapshot>,
	write: (transaction: Prisma.TransactionClient) => Promise<T>,
): Promise<T> =>
	prisma.$transaction(async (transaction) => {
		// A deleted entity has no state afterwards, so its name is read before the write.
		const namesBeforeDelete = new Map<string, string | null>();
		if (options.action === 'delete') {
			for (const entityId of [options.entityId].flat()) {
				const snapshot = await options.entity.findSnapshot(transaction, entityId);
				if (snapshot) {
					namesBeforeDelete.set(entityId, options.entity.getName(snapshot));
				}
			}
		}

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
				entityName: (snapshot ? options.entity.getName(snapshot) : namesBeforeDelete.get(entityId)) ?? null,
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
