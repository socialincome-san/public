import { resultFail, resultOk } from '@/lib/result';
import type { AuditActor, AuditedEntity, AuditEventRecord } from './audit-types';

// In-memory stand-in for the database: transactions buffer writes and see
// committed data (READ COMMITTED), row locks are held until commit or
// rollback, and audit events only become visible on commit.

type Row = { id: string; name: string; phone: string | null };

type FakeTransaction = {
	writes: Map<string, Row | null>;
	events: AuditEventRecord[];
	releases: (() => void)[];
	held: Set<string>;
};

const mockDatabase = {
	rows: new Map<string, Row>(),
	events: [] as AuditEventRecord[],
	failInsert: false,
	locks: new Map<string, Promise<void>>(),
	transactions: new WeakMap<object, FakeTransaction>(),
};

jest.mock('@/lib/database/audited-transaction', () => ({
	runAuditedTransaction: async (work: (transaction: object) => Promise<unknown>) => {
		const token = {};
		const transaction: FakeTransaction = { writes: new Map(), events: [], releases: [], held: new Set() };
		mockDatabase.transactions.set(token, transaction);
		try {
			const result = await work(token);
			for (const [id, row] of transaction.writes) {
				if (row) {
					mockDatabase.rows.set(id, row);
				} else {
					mockDatabase.rows.delete(id);
				}
			}
			mockDatabase.events.push(...transaction.events);

			return result;
		} finally {
			transaction.releases.forEach((release) => release());
		}
	},
	insertAuditEvents: (token: object, events: AuditEventRecord[]) => {
		if (mockDatabase.failInsert) {
			throw new Error('Audit insert failed');
		}
		fakeTransaction(token).events.push(...events);
	},
}));

import { getSessionAuditContext, withAudit } from './with-audit';

const fakeTransaction = (token: object): FakeTransaction => {
	const transaction = mockDatabase.transactions.get(token);
	if (!transaction) {
		throw new Error('Unknown transaction');
	}

	return transaction;
};

const read = (transaction: FakeTransaction, id: string): Row | null => {
	const row = transaction.writes.has(id) ? transaction.writes.get(id) : mockDatabase.rows.get(id);

	return row ? { ...row } : null;
};

const write = (token: object, id: string, row: Row | null): void => {
	fakeTransaction(token).writes.set(id, row);
};

const lock = async (transaction: FakeTransaction, id: string): Promise<void> => {
	if (transaction.held.has(id)) {
		return;
	}
	while (mockDatabase.locks.has(id)) {
		await mockDatabase.locks.get(id);
	}

	let release = (): void => undefined;
	mockDatabase.locks.set(
		id,
		new Promise<void>((resolve) => {
			release = () => {
				mockDatabase.locks.delete(id);
				resolve();
			};
		}),
	);
	transaction.held.add(id);
	transaction.releases.push(release);
};

const entity: AuditedEntity<Row> = {
	type: 'thing',
	fields: { name: 'plain', phone: 'personal' },
	findSnapshots: async (token, ids) => {
		const transaction = fakeTransaction(token);
		for (const id of [...ids].sort()) {
			await lock(transaction, id);
		}

		return ids.flatMap((id) => {
			const row = read(transaction, id);

			return row ? [row] : [];
		});
	},
};

const operator: AuditActor = { type: 'user', id: 'user-1' };

const auditOptions = { entity, actor: operator, source: 'portal' } as const;

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 5));

describe('withAudit', () => {
	beforeEach(() => {
		mockDatabase.rows = new Map([
			['a', { id: 'a', name: 'Ada', phone: '+1' }],
			['b', { id: 'b', name: 'Bob', phone: null }],
		]);
		mockDatabase.events = [];
		mockDatabase.failInsert = false;
	});

	test('records an update with the actor, source and metadata in the same commit', async () => {
		const result = await withAudit(
			{ ...auditOptions, action: 'update', entityId: 'a', metadata: { operation: 'test' } },
			(transaction) => {
				write(transaction, 'a', { id: 'a', name: 'Grace', phone: '+2' });

				return Promise.resolve(resultOk('done'));
			},
		);

		expect(result).toEqual({ success: true, data: 'done', status: undefined });
		expect(mockDatabase.rows.get('a')?.name).toBe('Grace');
		expect(mockDatabase.events).toEqual([
			{
				actor: { type: 'user', id: 'user-1' },
				entityType: 'thing',
				entityId: 'a',
				action: 'update',
				source: 'portal',
				changes: [
					{ path: 'name', old: 'Ada', new: 'Grace' },
					{ path: 'phone', old: '+1', new: '+2' },
				],
				metadata: { operation: 'test' },
			},
		]);
	});

	test('records no event for an update that changes nothing audited', async () => {
		await withAudit({ ...auditOptions, action: 'update', entityId: 'a' }, (transaction) => {
			write(transaction, 'a', { id: 'a', name: 'Ada', phone: '+1' });

			return Promise.resolve(resultOk(undefined));
		});

		expect(mockDatabase.events).toEqual([]);
	});

	test('records a create using the returned id and redacts personal values', async () => {
		await withAudit({ ...auditOptions, action: 'create' }, (transaction) => {
			const row = { id: 'c', name: 'Cleo', phone: '+3' };
			write(transaction, 'c', row);

			return Promise.resolve(resultOk(row));
		});

		expect(mockDatabase.events).toMatchObject([
			{
				entityId: 'c',
				action: 'create',
				changes: [
					{ path: 'name', old: null, new: 'Cleo' },
					{ path: 'phone', redacted: true },
				],
			},
		]);
	});

	test('records a delete', async () => {
		await withAudit({ ...auditOptions, action: 'delete', entityId: 'a' }, (transaction) => {
			write(transaction, 'a', null);

			return Promise.resolve(resultOk(undefined));
		});

		expect(mockDatabase.rows.has('a')).toBe(false);
		expect(mockDatabase.events).toMatchObject([
			{
				entityId: 'a',
				action: 'delete',
				changes: [
					{ path: 'name', old: 'Ada', new: null },
					{ path: 'phone', redacted: true },
				],
			},
		]);
	});

	test('records one event per entity of a bulk operation', async () => {
		await withAudit(
			{
				...auditOptions,
				action: 'update',
				entityId: ['a', 'b'],
				actor: { type: 'system', id: 'nightly-job' },
				source: 'system',
			},
			(transaction) => {
				write(transaction, 'a', { id: 'a', name: 'Ada', phone: null });
				write(transaction, 'b', { id: 'b', name: 'Bob', phone: '+4' });

				return Promise.resolve(resultOk(undefined));
			},
		);

		expect(mockDatabase.events).toMatchObject([
			{ entityId: 'a', actor: { type: 'system', id: 'nightly-job' }, source: 'system' },
			{ entityId: 'b', actor: { type: 'system', id: 'nightly-job' }, source: 'system' },
		]);
	});

	test('rolls back the write and returns the failure when write fails', async () => {
		const result = await withAudit({ ...auditOptions, action: 'update', entityId: 'a' }, (transaction) => {
			write(transaction, 'a', { id: 'a', name: 'Grace', phone: '+1' });

			return Promise.resolve(resultFail('Business rule violated'));
		});

		expect(result).toEqual({ success: false, error: 'Business rule violated', status: undefined });
		expect(mockDatabase.rows.get('a')?.name).toBe('Ada');
		expect(mockDatabase.events).toEqual([]);
	});

	test('rolls back the write when the audit event cannot be stored', async () => {
		mockDatabase.failInsert = true;

		await expect(
			withAudit({ ...auditOptions, action: 'update', entityId: 'a' }, (transaction) => {
				write(transaction, 'a', { id: 'a', name: 'Grace', phone: '+1' });

				return Promise.resolve(resultOk(undefined));
			}),
		).rejects.toThrow('Audit insert failed');
		expect(mockDatabase.rows.get('a')?.name).toBe('Ada');
	});

	test('fails without writing when a target entity does not exist', async () => {
		const write = jest.fn();

		const result = await withAudit({ ...auditOptions, action: 'update', entityId: ['a', 'missing'] }, write);

		expect(result).toEqual({ success: false, error: 'Entity not found.', status: undefined });
		expect(write).not.toHaveBeenCalled();
	});

	test('rolls back a delete that left the entity in place', async () => {
		await expect(
			withAudit({ ...auditOptions, action: 'delete', entityId: 'a' }, () => Promise.resolve(resultOk(undefined))),
		).rejects.toThrow('left the entity in an unexpected state');
	});

	test('rolls back a create that does not return the created id', async () => {
		await expect(
			withAudit({ ...auditOptions, action: 'create' }, (transaction) => {
				write(transaction, 'c', { id: 'c', name: 'Cleo', phone: null });

				return Promise.resolve(resultOk({ created: true }));
			}),
		).rejects.toThrow('must return the created entity with its id');
		expect(mockDatabase.rows.has('c')).toBe(false);
	});

	test('serializes concurrent updates so each event has exact before values', async () => {
		const first = withAudit({ ...auditOptions, action: 'update', entityId: 'a' }, async (transaction) => {
			await nextTick();
			write(transaction, 'a', { id: 'a', name: 'Grace', phone: '+1' });

			return resultOk(undefined);
		});
		const second = withAudit(
			{ ...auditOptions, action: 'update', entityId: 'a', actor: { type: 'recipient', id: 'a' }, source: 'mobile-app' },
			(transaction) => {
				const current = read(fakeTransaction(transaction), 'a');
				write(transaction, 'a', { id: 'a', name: current?.name ?? '', phone: '+9' });

				return Promise.resolve(resultOk(undefined));
			},
		);

		await Promise.all([first, second]);

		expect(mockDatabase.rows.get('a')).toEqual({ id: 'a', name: 'Grace', phone: '+9' });
		expect(mockDatabase.events.map(({ actor, changes }) => ({ actor: actor.type, changes }))).toEqual([
			{ actor: 'user', changes: [{ path: 'name', old: 'Ada', new: 'Grace' }] },
			{ actor: 'recipient', changes: [{ path: 'phone', old: '+1', new: '+9' }] },
		]);
	});
});

describe('getSessionAuditContext', () => {
	test('attributes writes to the session and its app area', () => {
		expect(getSessionAuditContext({ type: 'local-partner', id: 'partner-1' })).toEqual({
			actor: { type: 'local-partner', id: 'partner-1' },
			source: 'partner-space',
		});
		expect(getSessionAuditContext({ type: 'user', id: 'user-1' }).source).toBe('portal');
	});
});
