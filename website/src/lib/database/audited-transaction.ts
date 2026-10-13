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
export type AuditedTransaction = { readonly [transactionBrand]: true };

const openTransactions = new WeakMap<AuditedTransaction, Prisma.TransactionClient>();

/** Internal to `src/lib/audit`; everything else uses `withAudit`. */
export const runAuditedTransaction = <T>(work: (transaction: AuditedTransaction) => Promise<T>): Promise<T> =>
	prisma.$transaction(async (client) => {
		const transaction: AuditedTransaction = Object.freeze({ [transactionBrand]: true as const });
		openTransactions.set(transaction, client);
		try {
			return await work(transaction);
		} finally {
			openTransactions.delete(transaction);
		}
	});

export const getTransactionClient = (transaction: AuditedTransaction): Prisma.TransactionClient => {
	const client = openTransactions.get(transaction);
	if (!client) {
		throw new Error('AuditedTransaction used outside of its withAudit callback.');
	}

	return client;
};

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
