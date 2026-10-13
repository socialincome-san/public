import { insertAuditEvents, runAuditedTransaction, type AuditedTransaction } from '@/lib/database/audited-transaction';
import { resultFail, type Result } from '@/lib/result';
import { computeAuditChanges } from './audit-changes';
import type { AuditAction, AuditActor, AuditedEntity, AuditEventRecord, AuditMetadata, AuditSource } from './audit-types';

type WithAuditOptions<TSnapshot extends { id: string }> = {
	entity: AuditedEntity<TSnapshot>;
	actor: AuditActor;
	source: AuditSource;
	metadata?: AuditMetadata;
} & ({ action: 'create' } | { action: 'update' | 'delete'; entityId: string | string[] });

/**
 * Runs `write` and records one audit event per affected entity in the same
 * database transaction:
 *
 * 1. lock and snapshot the target entities (update, delete),
 * 2. run `write` with the transaction handle,
 * 3. snapshot again, diff with the entity's field policy and insert the events.
 *
 * A failed Result from `write` rolls back and is returned. Exceptions,
 * including a failed audit insert, roll back and are rethrown. Updates that
 * change no audited field record no event. `create` takes the entity id from
 * `data.id`, so `write` must return the created row.
 */
export const withAudit = async <TSnapshot extends { id: string }, TData>(
	options: WithAuditOptions<TSnapshot>,
	write: (transaction: AuditedTransaction) => Promise<Result<TData>>,
): Promise<Result<TData>> => {
	const rollback = new Error('withAudit rollback');
	let failure: Result<TData> | undefined;

	try {
		return await runAuditedTransaction(async (transaction) => {
			const targetIds = 'entityId' in options ? [...new Set([options.entityId].flat())] : [];
			const before = await findSnapshotsById(options.entity, transaction, targetIds);
			if (before.size !== targetIds.length) {
				failure = resultFail('Entity not found.');
				throw rollback;
			}

			const result = await write(transaction);
			if (!result.success) {
				failure = result;
				throw rollback;
			}

			const entityIds = options.action === 'create' ? [getCreatedId(result.data)] : targetIds;
			const after = await findSnapshotsById(options.entity, transaction, entityIds);
			const events = entityIds.flatMap((entityId): AuditEventRecord[] => {
				const previous = before.get(entityId) ?? null;
				const next = after.get(entityId) ?? null;
				assertLifecycle(options.action, entityId, next !== null);

				const changes = computeAuditChanges(options.action, options.entity.fields, previous, next);
				if (options.action === 'update' && changes.length === 0) {
					return [];
				}

				return [
					{
						actor: { type: options.actor.type, id: options.actor.id },
						entityType: options.entity.type,
						entityId,
						action: options.action,
						source: options.source,
						changes,
						metadata: options.metadata ?? null,
					},
				];
			});
			await insertAuditEvents(transaction, events);

			return result;
		});
	} catch (error) {
		if (error === rollback && failure) {
			return failure;
		}

		throw error;
	}
};

export const systemActor = (name: string): AuditActor => ({ type: 'system', id: name });

type SessionActor = {
	type: 'user' | 'local-partner' | 'contributor';
	id: string;
};

const sessionSources = {
	user: 'portal',
	'local-partner': 'partner-space',
	contributor: 'website',
} as const satisfies Record<SessionActor['type'], AuditSource>;

/** Actor and source for writes made by a signed-in session. */
export const getSessionAuditContext = (session: SessionActor): { actor: AuditActor; source: AuditSource } => ({
	actor: { type: session.type, id: session.id },
	source: sessionSources[session.type],
});

const findSnapshotsById = async <TSnapshot extends { id: string }>(
	entity: AuditedEntity<TSnapshot>,
	transaction: AuditedTransaction,
	ids: string[],
): Promise<Map<string, TSnapshot>> => {
	if (ids.length === 0) {
		return new Map();
	}

	const snapshots = await entity.findSnapshots(transaction, ids);

	return new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]));
};

const getCreatedId = (data: unknown): string => {
	if (typeof data === 'object' && data !== null && 'id' in data && typeof data.id === 'string') {
		return data.id;
	}

	throw new Error('Audited create must return the created entity with its id.');
};

const assertLifecycle = (action: AuditAction, entityId: string, existsAfter: boolean): void => {
	if (action === 'delete' ? existsAfter : !existsAfter) {
		throw new Error(`Audited ${action} of ${entityId} left the entity in an unexpected state.`);
	}
};
