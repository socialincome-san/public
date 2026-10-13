import type { Prisma } from '@/generated/prisma/client';
import type { AuditEventRecord } from '@/lib/audit/audit-types';
import { prisma } from './prisma';

// The only Prisma-specific part of auditing besides the repositories.
// Swapping the database means reimplementing this file.

const transactionBrand = Symbol('AuditedTransaction');

/**
 * Opaque handle for one audited transaction. Only `withAudit` creates it,
 * services pass it on, and repositories unwrap it with `getTransactionClient`.
 */
export type AuditedTransaction = { readonly [transactionBrand]: Prisma.TransactionClient };

// Bulk operations (program deletion, candidate assignment) snapshot every
// entity twice; Prisma's 5 s default is too tight for them.
const TRANSACTION_TIMEOUT_MS = 30_000;

/** Internal to `src/lib/audit`; everything else uses `withAudit`. */
export const runAuditedTransaction = <T>(work: (transaction: AuditedTransaction) => Promise<T>): Promise<T> =>
	prisma.$transaction((client) => work({ [transactionBrand]: client }), { timeout: TRANSACTION_TIMEOUT_MS });

export const getTransactionClient = (transaction: AuditedTransaction): Prisma.TransactionClient =>
	transaction[transactionBrand];

/** Internal to `src/lib/audit`; everything else uses `withAudit`. */
export const insertAuditEvents = async (transaction: AuditedTransaction, events: AuditEventRecord[]): Promise<void> => {
	if (events.length === 0) {
		return;
	}

	await getTransactionClient(transaction).auditEvent.createMany({
		data: events.map((event) => ({
			actorType: event.actor.type,
			actorId: event.actor.id,
			entityType: event.entityType,
			entityId: event.entityId,
			action: event.action,
			source: event.source,
			changes: event.changes,
			metadata: event.metadata ?? undefined,
		})),
	});
};
