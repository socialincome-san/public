const mockCommitted: { rows: Map<string, string>; versions: unknown[] } = { rows: new Map(), versions: [] };
const mockFailVersionInsert = { value: false };
const mockTransactionRows = new WeakMap<object, Map<string, string>>();

// Buffers writes and versions per transaction and applies them only on
// commit, like a database transaction.
jest.mock('./prisma', () => ({
	prisma: {
		$transaction: async (work: (transaction: unknown) => Promise<unknown>) => {
			const rows = new Map(mockCommitted.rows);
			const versions: unknown[] = [];
			const transaction = {
				entityVersion: {
					findFirst: () => Promise.resolve(mockCommitted.versions.length > 0 ? { id: 'version' } : null),
					create: ({ data }: { data: unknown }) => {
						if (mockFailVersionInsert.value) {
							return Promise.reject(new Error('Version insert failed'));
						}
						versions.push(data);

						return Promise.resolve();
					},
				},
			};
			mockTransactionRows.set(transaction, rows);
			const result = await work(transaction);
			mockCommitted.rows = rows;
			mockCommitted.versions.push(...versions);

			return result;
		},
	},
}));

import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, type VersionedEntity } from './audited-write';

const rowsOf = (transaction: object): Map<string, string> => {
	const rows = mockTransactionRows.get(transaction);
	if (!rows) {
		throw new Error('Unexpected transaction');
	}

	return rows;
};

const entity: VersionedEntity = {
	type: 'thing',
	findSnapshot: (transaction, id) => {
		const name = rowsOf(transaction).get(id);

		return Promise.resolve(name === undefined ? null : { name });
	},
};

const portal: AuditContext = { actor: { type: 'user', id: 'user-1' }, source: 'portal', metadata: { operation: 'test' } };

describe('auditedWrite', () => {
	beforeEach(() => {
		mockCommitted.rows = new Map([['a', 'Ada']]);
		mockCommitted.versions = [];
		mockFailVersionInsert.value = false;
	});

	test('stores the state after the write with who made it', async () => {
		const result = await auditedWrite({ entity, context: portal, action: 'update', entityId: 'a' }, (transaction) => {
			rowsOf(transaction).set('a', 'Grace');

			return Promise.resolve('done');
		});

		expect(result).toBe('done');
		expect(mockCommitted.versions).toEqual([
			{
				entityType: 'thing',
				entityId: 'a',
				action: 'baseline',
				actorType: 'system',
				actorId: 'baseline',
				source: 'system',
				snapshot: { name: 'Ada' },
			},
			{
				entityType: 'thing',
				entityId: 'a',
				action: 'update',
				actorType: 'user',
				actorId: 'user-1',
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

		expect(mockCommitted.versions).toMatchObject([{ entityId: 'b', action: 'create', snapshot: { name: 'Bob' } }]);
	});

	test('stores no snapshot for a delete', async () => {
		await auditedWrite({ entity, context: portal, action: 'delete', entityId: 'a' }, (transaction) => {
			rowsOf(transaction).delete('a');

			return Promise.resolve();
		});

		expect(mockCommitted.versions).toMatchObject([
			{ action: 'baseline', snapshot: { name: 'Ada' } },
			{ entityId: 'a', action: 'delete', snapshot: undefined },
		]);
	});

	test('stores the baseline only before the first versioned write', async () => {
		const rename = (name: string) =>
			auditedWrite({ entity, context: portal, action: 'update', entityId: 'a' }, (transaction) => {
				rowsOf(transaction).set('a', name);

				return Promise.resolve();
			});

		await rename('Grace');
		await rename('Hedy');

		expect(mockCommitted.versions).toMatchObject([{ action: 'baseline' }, { action: 'update' }, { action: 'update' }]);
	});

	test('rolls back the write when the version cannot be stored', async () => {
		mockFailVersionInsert.value = true;

		await expect(
			auditedWrite({ entity, context: portal, action: 'update', entityId: 'a' }, (transaction) => {
				rowsOf(transaction).set('a', 'Grace');

				return Promise.resolve();
			}),
		).rejects.toThrow('Version insert failed');
		expect(mockCommitted.rows.get('a')).toBe('Ada');
	});
});
