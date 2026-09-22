import { Currency, PayoutStatus } from '@/generated/prisma/enums';
import type { PreviewPayout } from '@/modules/payout-processes/payout-process.types';

const mockCreateMany = jest.fn();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		payout: {
			createMany: mockCreateMany,
		},
	},
}));

import { createPayoutProcessPayouts } from './payout.repository';

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
});
