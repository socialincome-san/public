import type { Prisma } from '@/generated/prisma/client';
import { computeAuditChanges } from '@/lib/audit/audit-changes';
import type { AuditAction, AuditContext, AuditFieldPolicy } from '@/lib/audit/audit-types';
import { prisma } from './prisma';

export type AuditedEntity<TSnapshot extends { id: string }> = {
	type: string;
	fields: AuditFieldPolicy<Omit<TSnapshot, 'id'>>;
	/** Must lock the row (SELECT … FOR UPDATE) so concurrent writes serialize. */
	findSnapshot: (transaction: Prisma.TransactionClient, id: string) => Promise<TSnapshot | null>;
};

type AuditedWriteOptions<TSnapshot extends { id: string }> = {
	entity: AuditedEntity<TSnapshot>;
	context: AuditContext;
} & ({ action: 'create' } | { action: 'update' | 'delete'; entityId: string });

/**
 * Runs `write` and stores its audit event in the same transaction: lock and
 * snapshot the entity, write, snapshot again, store the diff. Throws, and
 * rolls back the write, if the event cannot be stored. Updates that change
 * no audited field store nothing. `create` takes the id from the returned
 * row.
 */
export const auditedWrite = async <TSnapshot extends { id: string }, T>(
	options: AuditedWriteOptions<TSnapshot>,
	write: (transaction: Prisma.TransactionClient) => Promise<T>,
): Promise<T> =>
	prisma.$transaction(async (transaction) => {
		const before = 'entityId' in options ? await options.entity.findSnapshot(transaction, options.entityId) : null;
		if ('entityId' in options && !before) {
			throw new Error(`Audited ${options.entity.type} ${options.entityId} not found.`);
		}

		const result = await write(transaction);
		const entityId = 'entityId' in options ? options.entityId : getCreatedId(result);
		const after = await options.entity.findSnapshot(transaction, entityId);
		assertLifecycle(options.action, after !== null);

		const changes = computeAuditChanges(options.action, options.entity.fields, before, after);
		if (options.action === 'update' && changes.length === 0) {
			return result;
		}

		await transaction.auditEvent.create({
			data: {
				actorType: options.context.actor.type,
				actorId: options.context.actor.id,
				entityType: options.entity.type,
				entityId,
				action: options.action,
				source: options.context.source,
				changes,
				metadata: options.context.metadata,
			},
		});

		return result;
	});

const getCreatedId = (data: unknown): string => {
	if (typeof data === 'object' && data !== null && 'id' in data && typeof data.id === 'string') {
		return data.id;
	}

	throw new Error('Audited create must return the created row with its id.');
};

const assertLifecycle = (action: AuditAction, existsAfter: boolean): void => {
	if (action === 'delete' ? existsAfter : !existsAfter) {
		throw new Error(`Audited ${action} left the entity in an unexpected state.`);
	}
};
