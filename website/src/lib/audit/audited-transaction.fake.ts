import type { AuditEventRecord } from './audit-types';

// Test double for '@/lib/database/audited-transaction'. Use it with
// jest.mock('@/lib/database/audited-transaction', () => jest.requireActual('@/lib/audit/audited-transaction.fake'));
// Events inserted in a transaction become visible in `auditLog.committed`
// only if the transaction does not throw, like a real commit.

type FakeTransaction = { readonly fake: true };

export const auditLog = {
	committed: [] as AuditEventRecord[],
	rollbacks: 0,
	failInserts: false,
	reset: () => {
		auditLog.committed = [];
		auditLog.rollbacks = 0;
		auditLog.failInserts = false;
	},
};

const pendingEvents = new WeakMap<FakeTransaction, AuditEventRecord[]>();

export const runAuditedTransaction = async <T>(work: (transaction: FakeTransaction) => Promise<T>): Promise<T> => {
	const transaction: FakeTransaction = { fake: true };
	pendingEvents.set(transaction, []);
	try {
		const result = await work(transaction);
		auditLog.committed.push(...(pendingEvents.get(transaction) ?? []));

		return result;
	} catch (error) {
		auditLog.rollbacks += 1;
		throw error;
	} finally {
		pendingEvents.delete(transaction);
	}
};

export const insertAuditEvents = (transaction: FakeTransaction, events: AuditEventRecord[]): Promise<void> => {
	if (auditLog.failInserts) {
		return Promise.reject(new Error('Audit insert failed'));
	}

	pendingEvents.get(transaction)?.push(...events);

	return Promise.resolve();
};

export const getTransactionClient = (): never => {
	throw new Error('Repositories are mocked in service tests; the fake has no database client.');
};
