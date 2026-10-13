import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { prisma } from './prisma';

export type VersionedEntity = {
	type: string;
	findSnapshot: (transaction: Prisma.TransactionClient, id: string) => Promise<Prisma.InputJsonObject | null>;
};

type AuditedWriteOptions = {
	entity: VersionedEntity;
	context: AuditContext;
} & ({ action: 'create' } | { action: 'update' | 'delete'; entityId: string });

/**
 * Runs `write` and stores the entity's state afterwards as a new version in
 * the same transaction, so the write rolls back if the version cannot be
 * stored. Updates that change nothing store no version. `create` takes the
 * id from the returned row.
 */
export const auditedWrite = async <T>(
	options: AuditedWriteOptions,
	write: (transaction: Prisma.TransactionClient) => Promise<T>,
): Promise<T> =>
	prisma.$transaction(async (transaction) => {
		const result = await write(transaction);
		const entityId = 'entityId' in options ? options.entityId : getCreatedId(result);
		const snapshot = options.action === 'delete' ? null : await options.entity.findSnapshot(transaction, entityId);
		if (options.action === 'update' && !(await hasChanged(transaction, options.entity.type, entityId, snapshot))) {
			return result;
		}

		await transaction.entityVersion.create({
			data: {
				entityType: options.entity.type,
				entityId,
				action: options.action,
				actorType: options.context.actor.type,
				actorId: options.context.actor.id,
				actorName: options.context.actor.name,
				source: options.context.source,
				snapshot: snapshot ?? undefined,
				metadata: options.context.metadata,
			},
		});

		return result;
	});

const hasChanged = async (
	transaction: Prisma.TransactionClient,
	entityType: string,
	entityId: string,
	snapshot: Prisma.InputJsonObject | null,
): Promise<boolean> => {
	const latest = await transaction.entityVersion.findFirst({
		where: { entityType, entityId },
		orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
		select: { snapshot: true },
	});

	return !latest || toStableJson(latest.snapshot) !== toStableJson(snapshot);
};

// Postgres reorders jsonb keys, so compare with sorted keys. Dates become
// the same ISO strings the stored version holds.
const toStableJson = (value: unknown): string =>
	JSON.stringify(value, (_key, item: unknown) =>
		item && typeof item === 'object' && !Array.isArray(item)
			? Object.fromEntries(Object.entries(item).sort(([left], [right]) => left.localeCompare(right)))
			: item,
	);

const getCreatedId = (data: unknown): string => {
	if (typeof data === 'object' && data !== null && 'id' in data && typeof data.id === 'string') {
		return data.id;
	}

	throw new Error('Audited create must return the created row with its id.');
};
