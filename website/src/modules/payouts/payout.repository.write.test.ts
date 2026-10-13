import { Currency, PayoutStatus } from '@/generated/prisma/enums';
import type { PreviewPayout } from '@/modules/payout-processes/payout-process.types';

const mockCreateManyAndReturn = jest.fn();
const mockCreateAuditEvent = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		$transaction: (work: (transaction: unknown) => Promise<unknown>) =>
			work({
				payout: {
					createManyAndReturn: mockCreateManyAndReturn,
					findUnique: ({ where }: { where: { id: string } }) => Promise.resolve({ recipientId: `recipient-of-${where.id}` }),
				},
				auditEvent: { create: mockCreateAuditEvent },
			}),
	},
}));

import { createPayoutProcessPayouts } from './payout.repository.write';

const audit = { actor: { type: 'user' as const, id: 'user-1' }, source: 'portal' as const };

describe('payout write repository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCreateManyAndReturn.mockResolvedValue([{ id: 'payout-1' }, { id: 'payout-2' }]);
	});

	test('maps payout-process previews to persistence fields', async () => {
		const preview: PreviewPayout = {
			recipientId: 'recipient-1',
			amount: 250,
			amountChf: 10,
			currency: Currency.SLE,
			status: PayoutStatus.paid,
			paymentAt: new Date('2026-09-01T00:00:00.000Z'),
			phoneNumber: '+23212345678',
			firstName: 'Ada',
			lastName: 'Lovelace',
		};

		await createPayoutProcessPayouts(audit, [preview]);

		expect(mockCreateManyAndReturn).toHaveBeenCalledWith({
			data: [
				{
					recipientId: 'recipient-1',
					amount: 250,
					amountChf: 10,
					currency: Currency.SLE,
					status: PayoutStatus.paid,
					paymentAt: new Date('2026-09-01T00:00:00.000Z'),
					phoneNumber: '+23212345678',
					comments: null,
				},
			],
			select: { id: true },
		});
	});

	test('stores one audit event per created payout', async () => {
		await createPayoutProcessPayouts(audit, []);

		expect(mockCreateAuditEvent.mock.calls.map(([{ data }]: [{ data: object }]) => data)).toMatchObject([
			{ entityType: 'payout', entityId: 'payout-1', action: 'create', actorId: 'user-1' },
			{ entityType: 'payout', entityId: 'payout-2', action: 'create', actorId: 'user-1' },
		]);
	});
});
