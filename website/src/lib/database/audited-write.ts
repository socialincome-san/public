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
 * stored. `create` takes the id from the returned row.
 *
 * Entities that existed before versioning get a `baseline` version of their
 * current state on their first write, so that write diffs against it.
 */
export const auditedWrite = async <T>(
	options: AuditedWriteOptions,
	write: (transaction: Prisma.TransactionClient) => Promise<T>,
): Promise<T> =>
	prisma.$transaction(async (transaction) => {
		if ('entityId' in options) {
			await storeBaselineIfMissing(transaction, options.entity, options.entityId);
		}

		const result = await write(transaction);
		const entityId = 'entityId' in options ? options.entityId : getCreatedId(result);
		const snapshot = options.action === 'delete' ? null : await options.entity.findSnapshot(transaction, entityId);

		await transaction.entityVersion.create({
			data: {
				entityType: options.entity.type,
				entityId,
				action: options.action,
				actorType: options.context.actor.type,
				actorId: options.context.actor.id,
				source: options.context.source,
				snapshot: snapshot ?? undefined,
				metadata: options.context.metadata,
			},
		});

		return result;
	});

const storeBaselineIfMissing = async (transaction: Prisma.TransactionClient, entity: VersionedEntity, entityId: string) => {
	const hasVersion = await transaction.entityVersion.findFirst({
		where: { entityType: entity.type, entityId },
		select: { id: true },
	});
	const snapshot = hasVersion ? null : await entity.findSnapshot(transaction, entityId);
	if (!snapshot) {
		return;
	}

	await transaction.entityVersion.create({
		data: {
			entityType: entity.type,
			entityId,
			action: 'baseline',
			actorType: 'system',
			actorId: 'baseline',
			source: 'system',
			snapshot,
		},
	});
};

const getCreatedId = (data: unknown): string => {
	if (typeof data === 'object' && data !== null && 'id' in data && typeof data.id === 'string') {
		return data.id;
	}

	throw new Error('Audited create must return the created row with its id.');
};
