import { Currency, PayoutStatus } from '@/generated/prisma/enums';
import type { PreviewPayout } from '@/modules/payout-processes/payout-process.types';

const mockCreateMany = jest.fn();
const mockAggregate = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		payout: {
			aggregate: mockAggregate,
			createMany: mockCreateMany,
		},
	},
}));

import { createPayoutProcessPayouts, findPaidOrConfirmedPayoutTotal } from './payout.repository';

describe('payout repository', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCreateMany.mockResolvedValue({ count: 1 });
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

		await createPayoutProcessPayouts([preview]);

		expect(mockCreateMany).toHaveBeenCalledWith({
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
		});
	});

	test('sums only paid or confirmed CHF payouts in the requested period', async () => {
		const dateRange = {
			gte: new Date('2025-01-01T00:00:00.000Z'),
			lt: new Date('2026-01-01T00:00:00.000Z'),
		};
		mockAggregate.mockResolvedValue({ _sum: { amountChf: 80 } });

		await findPaidOrConfirmedPayoutTotal(dateRange);

		expect(mockAggregate).toHaveBeenCalledWith({
			where: {
				status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] },
				paymentAt: dateRange,
			},
			_sum: { amountChf: true },
		});
	});
});
