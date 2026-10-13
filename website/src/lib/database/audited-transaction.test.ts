const mockCreateMany = jest.fn();
const mockClient = { auditEvent: { createMany: mockCreateMany } };

jest.mock('./prisma', () => ({
	prisma: {
		$transaction: async (work: (client: unknown) => Promise<unknown>) => work(mockClient),
	},
}));

import { getTransactionClient, insertAuditEvents, runAuditedTransaction } from './audited-transaction';

describe('audited transaction adapter', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('hands repositories the transaction client', async () => {
		await runAuditedTransaction((transaction) => {
			expect(getTransactionClient(transaction)).toBe(mockClient);

			return Promise.resolve();
		});
	});

	test('stores events as flat rows and skips empty batches', async () => {
		await runAuditedTransaction(async (transaction) => {
			await insertAuditEvents(transaction, []);
			await insertAuditEvents(transaction, [
				{
					actor: { type: 'recipient', id: 'recipient-1' },
					entityType: 'recipient',
					entityId: 'recipient-1',
					action: 'update',
					source: 'mobile-app',
					changes: [{ path: 'termsAccepted', old: false, new: true }],
					metadata: null,
				},
			]);
		});

		expect(mockCreateMany).toHaveBeenCalledTimes(1);
		expect(mockCreateMany).toHaveBeenCalledWith({
			data: [
				{
					actorType: 'recipient',
					actorId: 'recipient-1',
					entityType: 'recipient',
					entityId: 'recipient-1',
					action: 'update',
					source: 'mobile-app',
					changes: [{ path: 'termsAccepted', old: false, new: true }],
					metadata: undefined,
				},
			],
		});
	});
});
