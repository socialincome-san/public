import { PayoutStatus } from '@/generated/prisma/enums';

const mockAggregate = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		payout: {
			aggregate: mockAggregate,
		},
	},
}));

import { findPaidOrConfirmedPayoutTotal } from './payout.repository.read';

describe('payout read repository', () => {
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
