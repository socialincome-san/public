import { PrismaClient, SubscriptionStatus } from '@/generated/prisma/client';
import { SubscriptionWriteService } from './subscription-write.service';

jest.mock('@/generated/prisma/client', () => ({
	PrismaClient: class {},
	SubscriptionPaymentMethod: {
		stripe: 'stripe',
		bank_transfer: 'bank_transfer',
	},
	SubscriptionStatus: {
		active: 'active',
		canceled: 'canceled',
		ended: 'ended',
	},
	DonationInterval: {
		monthly: 'monthly',
	},
}));

jest.mock('@/lib/utils/now', () => ({
	now: jest.fn(() => new Date('2026-03-01T12:00:00.000Z')),
}));

describe('SubscriptionWriteService bank transfer mutations', () => {
	const findFirst = jest.fn();
	const update = jest.fn();
	const db = {
		subscription: { findFirst, update },
	} as unknown as PrismaClient;

	const createService = () =>
		new SubscriptionWriteService(db, {
			error: jest.fn(),
			warn: jest.fn(),
			info: jest.fn(),
			debug: jest.fn(),
			alert: jest.fn(),
		});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('rejects invalid amounts and missing or ended subscriptions', async () => {
		const service = createService();

		const invalidAmount = await service.updateBankTransferAmount({
			contributorId: 'contributor-1',
			subscriptionId: 'sub-bank',
			amount: 0,
		});
		expect(invalidAmount.success).toBe(false);
		expect(findFirst).not.toHaveBeenCalled();

		findFirst.mockResolvedValueOnce(null);
		const missing = await service.updateBankTransferAmount({
			contributorId: 'contributor-1',
			subscriptionId: 'sub-bank',
			amount: 50,
		});
		expect(missing).toEqual({ success: false, error: 'Subscription not found' });
		expect(update).not.toHaveBeenCalled();

		findFirst.mockResolvedValueOnce({ id: 'sub-bank', status: SubscriptionStatus.ended });
		const ended = await service.cancelBankTransfer({
			contributorId: 'contributor-1',
			subscriptionId: 'sub-bank',
			reason: 'other',
		});
		expect(ended).toEqual({ success: false, error: 'Subscription not found' });
		expect(update).not.toHaveBeenCalled();
	});
});
