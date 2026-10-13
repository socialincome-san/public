import type { AuditContext } from '@/lib/audit/audit-types';

// In-memory stand-in for Postgres: transactions buffer writes and read
// committed data (READ COMMITTED), row locks are held until commit or
// rollback, and audit events only become visible on commit.

type Row = { id: string; name: string; phone: string | null };

type StoredEvent = {
	entityId: string;
	action: string;
	actorType: string;
	source: string;
	changes: unknown;
	metadata: unknown;
};

type FakeTransaction = {
	writes: Map<string, Row | null>;
	events: StoredEvent[];
	held: Set<string>;
	releases: (() => void)[];
	auditEvent: { create: (args: { data: StoredEvent }) => Promise<void> };
};

const mockDatabase: {
	rows: Map<string, Row>;
	events: StoredEvent[];
	failInsert: boolean;
	locks: Map<string, Promise<void>>;
} = {
	rows: new Map(),
	events: [],
	failInsert: false,
	locks: new Map(),
};

jest.mock('./prisma', () => ({
	prisma: {
		$transaction: async (work: (transaction: FakeTransaction) => Promise<unknown>) => {
			const transaction: FakeTransaction = {
				writes: new Map(),
				events: [],
				held: new Set(),
				releases: [],
				auditEvent: {
					create: ({ data }) => {
						if (mockDatabase.failInsert) {
							return Promise.reject(new Error('Audit insert failed'));
						}
						transaction.events.push(data);

						return Promise.resolve();
					},
				},
			};
			try {
				const result = await work(transaction);
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
	},
}));

import { auditedWrite, type AuditedEntity } from './audited-write';

const isFake = (transaction: unknown): transaction is FakeTransaction =>
	typeof transaction === 'object' && transaction !== null && 'writes' in transaction;

const asFake = (transaction: unknown): FakeTransaction => {
	if (!isFake(transaction)) {
		throw new Error('Unexpected transaction');
	}

	return transaction;
};

const read = (transaction: FakeTransaction, id: string): Row | null => {
	const row = transaction.writes.has(id) ? transaction.writes.get(id) : mockDatabase.rows.get(id);

	return row ? { ...row } : null;
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
	findSnapshot: async (transaction, id) => {
		const fake = asFake(transaction);
		await lock(fake, id);

		return read(fake, id);
	},
};

const portal: AuditContext = { actor: { type: 'user', id: 'user-1' }, source: 'portal' };

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 5));

describe('auditedWrite', () => {
	beforeEach(() => {
		mockDatabase.rows = new Map([['a', { id: 'a', name: 'Ada', phone: '+1' }]]);
		mockDatabase.events = [];
		mockDatabase.failInsert = false;
	});

	test('stores the update with actor, source and metadata in the same commit', async () => {
		const result = await auditedWrite(
			{ entity, context: { ...portal, metadata: { operation: 'test' } }, action: 'update', entityId: 'a' },
			(transaction) => {
				asFake(transaction).writes.set('a', { id: 'a', name: 'Grace', phone: '+2' });

				return Promise.resolve('done');
			},
		);

		expect(result).toBe('done');
		expect(mockDatabase.rows.get('a')?.name).toBe('Grace');
		expect(mockDatabase.events).toEqual([
			{
				actorType: 'user',
				actorId: 'user-1',
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

	test('stores nothing for an update that changes nothing audited', async () => {
		await auditedWrite({ entity, context: portal, action: 'update', entityId: 'a' }, () => Promise.resolve());

		expect(mockDatabase.events).toEqual([]);
	});

	test('stores a create with the returned id and redacts personal values', async () => {
		await auditedWrite({ entity, context: portal, action: 'create' }, (transaction) => {
			const row = { id: 'c', name: 'Cleo', phone: '+3' };
			asFake(transaction).writes.set('c', row);

			return Promise.resolve(row);
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

	test('stores a delete without personal values', async () => {
		await auditedWrite({ entity, context: portal, action: 'delete', entityId: 'a' }, (transaction) => {
			asFake(transaction).writes.set('a', null);

			return Promise.resolve();
		});

		expect(mockDatabase.rows.has('a')).toBe(false);
		expect(mockDatabase.events).toMatchObject([
			{
				action: 'delete',
				changes: [
					{ path: 'name', old: 'Ada', new: null },
					{ path: 'phone', redacted: true },
				],
			},
		]);
	});

	test('rolls back the write when the audit event cannot be stored', async () => {
		mockDatabase.failInsert = true;

		await expect(
			auditedWrite({ entity, context: portal, action: 'update', entityId: 'a' }, (transaction) => {
				asFake(transaction).writes.set('a', { id: 'a', name: 'Grace', phone: '+1' });

				return Promise.resolve();
			}),
		).rejects.toThrow('Audit insert failed');
		expect(mockDatabase.rows.get('a')?.name).toBe('Ada');
	});

	test('fails before writing when the entity does not exist', async () => {
		const write = jest.fn();

		await expect(auditedWrite({ entity, context: portal, action: 'update', entityId: 'missing' }, write)).rejects.toThrow(
			'not found',
		);
		expect(write).not.toHaveBeenCalled();
	});

	test('rolls back a delete that left the entity in place', async () => {
		await expect(
			auditedWrite({ entity, context: portal, action: 'delete', entityId: 'a' }, () => Promise.resolve()),
		).rejects.toThrow('unexpected state');
	});

	test('serializes concurrent updates so each event has exact old values', async () => {
		const first = auditedWrite({ entity, context: portal, action: 'update', entityId: 'a' }, async (transaction) => {
			await nextTick();
			asFake(transaction).writes.set('a', { id: 'a', name: 'Grace', phone: '+1' });
		});
		const second = auditedWrite(
			{ entity, context: { actor: { type: 'recipient', id: 'a' }, source: 'mobile-app' }, action: 'update', entityId: 'a' },
			(transaction) => {
				const fake = asFake(transaction);
				const current = read(fake, 'a');
				fake.writes.set('a', { id: 'a', name: current?.name ?? '', phone: '+9' });

				return Promise.resolve();
			},
		);

		await Promise.all([first, second]);

		expect(mockDatabase.rows.get('a')).toEqual({ id: 'a', name: 'Grace', phone: '+9' });
		expect(mockDatabase.events.map(({ actorType, changes }) => ({ actorType, changes }))).toEqual([
			{ actorType: 'user', changes: [{ path: 'name', old: 'Ada', new: 'Grace' }] },
			{ actorType: 'recipient', changes: [{ path: 'phone', old: '+1', new: '+9' }] },
		]);
	});
});
