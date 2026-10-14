type StoredEvent = { entityId: string; snapshot?: unknown };
const mockCommitted: { rows: Map<string, string>; events: StoredEvent[] } = { rows: new Map(), events: [] };
const mockFailEventInsert = { value: false };
const mockTransactionRows = new WeakMap<object, Map<string, string>>();

// Buffers writes and events per transaction and applies them only on
// commit, like a database transaction.
jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		$transaction: async (work: (transaction: unknown) => Promise<unknown>) => {
			const rows = new Map(mockCommitted.rows);
			const events: StoredEvent[] = [];
			const transaction = {
				auditEvent: {
					findFirst: ({ where }: { where: { entityId: string } }) =>
						Promise.resolve(mockCommitted.events.filter(({ entityId }) => entityId === where.entityId).at(-1) ?? null),
					createMany: ({ data }: { data: StoredEvent[] }) => {
						if (mockFailEventInsert.value) {
							return Promise.reject(new Error('Audit event insert failed'));
						}
						events.push(...data);

						return Promise.resolve();
					},
					create: ({ data }: { data: StoredEvent }) => {
						events.push(data);

						return Promise.resolve();
					},
				},
			};
			mockTransactionRows.set(transaction, rows);
			const result = await work(transaction);
			mockCommitted.rows = rows;
			mockCommitted.events.push(...events);

			return result;
		},
	},
}));

import type { AuditContext } from './audit-types';
import { auditedWrite, defineAuditedEntity, recordAuditBaseline } from './audited-write';

const rowsOf = (transaction: object): Map<string, string> => {
	const rows = mockTransactionRows.get(transaction);
	if (!rows) {
		throw new Error('Unexpected transaction');
	}

	return rows;
};

const entity = defineAuditedEntity({
	type: 'thing',
	findSnapshot: (transaction, id) => {
		const name = rowsOf(transaction).get(id);

		return Promise.resolve(name === undefined ? null : { name });
	},
	getName: ({ name }) => name,
});

const portal: AuditContext = {
	actor: { type: 'user', id: 'user-1', name: 'Max Operator' },
	source: 'portal',
	metadata: { operation: 'test' },
};

describe('auditedWrite', () => {
	beforeEach(() => {
		mockCommitted.rows = new Map([['a', 'Ada']]);
		mockCommitted.events = [];
		mockFailEventInsert.value = false;
	});

	test('stores the state after the write with who made it', async () => {
		const result = await auditedWrite({ entity, context: portal, action: 'update', entityId: 'a' }, (transaction) => {
			rowsOf(transaction).set('a', 'Grace');

			return Promise.resolve('done');
		});

		expect(result).toBe('done');
		expect(mockCommitted.events).toEqual([
			{
				entityType: 'thing',
				entityId: 'a',
				entityName: 'Grace',
				action: 'update',
				actorType: 'user',
				actorId: 'user-1',
				actorName: 'Max Operator',
				source: 'portal',
				snapshot: { name: 'Grace' },
				metadata: { operation: 'test' },
			},
		]);
	});

	test('takes the id of a created row from the result', async () => {
		await auditedWrite({ entity, context: portal, action: 'create' }, (transaction) => {
			rowsOf(transaction).set('b', 'Bob');

			return Promise.resolve({ id: 'b' });
		});

		expect(mockCommitted.events).toMatchObject([{ entityId: 'b', action: 'create', snapshot: { name: 'Bob' } }]);
	});

	test('takes the ids of several created rows from the result', async () => {
		await auditedWrite({ entity, context: portal, action: 'create' }, (transaction) => {
			rowsOf(transaction).set('b', 'Bob');
			rowsOf(transaction).set('c', 'Cleo');

			return Promise.resolve([{ id: 'b' }, { id: 'c' }]);
		});

		expect(mockCommitted.events).toMatchObject([
			{ entityId: 'b', snapshot: { name: 'Bob' } },
			{ entityId: 'c', snapshot: { name: 'Cleo' } },
		]);
	});

	test('stores an event per changed entity when one write updates several', async () => {
		mockCommitted.rows.set('b', 'Bob');
		await auditedWrite({ entity, context: portal, action: 'update', entityId: ['a', 'b'] }, (transaction) => {
			rowsOf(transaction).set('a', 'Grace');
			rowsOf(transaction).set('b', 'Bea');

			return Promise.resolve({ count: 2 });
		});
		await auditedWrite({ entity, context: portal, action: 'update', entityId: ['a', 'b'] }, (transaction) => {
			rowsOf(transaction).set('b', 'Bob');

			return Promise.resolve({ count: 2 });
		});

		expect(mockCommitted.events).toMatchObject([
			{ entityId: 'a', snapshot: { name: 'Grace' } },
			{ entityId: 'b', snapshot: { name: 'Bea' } },
			{ entityId: 'b', snapshot: { name: 'Bob' } },
		]);
	});

	test('takes the ids of updated rows from the result when they are only known afterwards', async () => {
		mockCommitted.rows.set('b', 'Bob');
		await auditedWrite({ entity, context: portal, action: 'update' }, (transaction) => {
			rowsOf(transaction).set('b', 'Bea');

			return Promise.resolve([{ id: 'b' }]);
		});

		expect(mockCommitted.events).toMatchObject([{ entityId: 'b', action: 'update', snapshot: { name: 'Bea' } }]);
	});

	test('stores no snapshot for a delete', async () => {
		await auditedWrite({ entity, context: portal, action: 'delete', entityId: 'a' }, (transaction) => {
			rowsOf(transaction).delete('a');

			return Promise.resolve();
		});

		expect(mockCommitted.events).toMatchObject([
			{ entityId: 'a', entityName: 'Ada', action: 'delete', snapshot: undefined },
		]);
	});

	test('stores no audit event for an update that changes nothing', async () => {
		const rename = (name: string) =>
			auditedWrite({ entity, context: portal, action: 'update', entityId: 'a' }, (transaction) => {
				rowsOf(transaction).set('a', name);

				return Promise.resolve();
			});

		await rename('Grace');
		await rename('Grace');

		expect(mockCommitted.events).toMatchObject([{ snapshot: { name: 'Grace' } }]);
	});

	test('rolls back the write when the audit event cannot be stored', async () => {
		mockFailEventInsert.value = true;

		await expect(
			auditedWrite({ entity, context: portal, action: 'update', entityId: 'a' }, (transaction) => {
				rowsOf(transaction).set('a', 'Grace');

				return Promise.resolve();
			}),
		).rejects.toThrow('Audit event insert failed');
		expect(mockCommitted.rows.get('a')).toBe('Ada');
	});
});

describe('recordAuditBaseline', () => {
	const system: AuditContext = { actor: { type: 'system', id: 'audit-baseline' }, source: 'system' };

	beforeEach(() => {
		mockCommitted.rows = new Map([['a', 'Ada']]);
		mockCommitted.events = [];
	});

	test('stores the current state of an entity without audit events', async () => {
		await expect(recordAuditBaseline(entity, system, 'a')).resolves.toBe(true);

		expect(mockCommitted.events).toMatchObject([
			{ entityId: 'a', entityName: 'Ada', action: 'baseline', snapshot: { name: 'Ada' } },
		]);
	});

	test('stores nothing for an entity that already has audit events', async () => {
		mockCommitted.events = [{ entityId: 'a', snapshot: { name: 'Ada' } }];

		await expect(recordAuditBaseline(entity, system, 'a')).resolves.toBe(false);
		expect(mockCommitted.events).toHaveLength(1);
	});

	test('stores nothing for a missing entity', async () => {
		await expect(recordAuditBaseline(entity, system, 'missing')).resolves.toBe(false);
		expect(mockCommitted.events).toEqual([]);
	});
});
