import { PrismaClient, SubscriptionPaymentMethod, SubscriptionStatus } from '@/generated/prisma/client';
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

	describe('updateBankTransferAmount', () => {
		it('updates amount for an owned active bank transfer subscription', async () => {
			findFirst.mockResolvedValue({ id: 'sub-bank', currency: 'CHF' });
			update.mockResolvedValue({});

			const result = await createService().updateBankTransferAmount({
				contributorId: 'contributor-1',
				subscriptionId: 'sub-bank',
				amount: 75,
			});

			expect(result).toEqual({ success: true, data: { amount: 75, currency: 'CHF' } });
			expect(findFirst).toHaveBeenCalledWith({
				where: {
					id: 'sub-bank',
					contributorId: 'contributor-1',
					paymentMethod: SubscriptionPaymentMethod.bank_transfer,
					status: SubscriptionStatus.active,
				},
				select: { id: true, currency: true },
			});
			expect(update).toHaveBeenCalledWith({
				where: { id: 'sub-bank' },
				data: { amount: 75 },
			});
		});

		it('rejects invalid amounts', async () => {
			const result = await createService().updateBankTransferAmount({
				contributorId: 'contributor-1',
				subscriptionId: 'sub-bank',
				amount: 0,
			});

			expect(result.success).toBe(false);
			expect(findFirst).not.toHaveBeenCalled();
		});

		it('rejects when subscription is missing or not owned', async () => {
			findFirst.mockResolvedValue(null);

			const result = await createService().updateBankTransferAmount({
				contributorId: 'contributor-1',
				subscriptionId: 'sub-bank',
				amount: 50,
			});

			expect(result).toEqual({ success: false, error: 'Subscription not found' });
			expect(update).not.toHaveBeenCalled();
		});
	});

	describe('cancelBankTransfer', () => {
		it('cancels an owned bank transfer subscription with reason', async () => {
			findFirst.mockResolvedValue({ id: 'sub-bank', status: SubscriptionStatus.active });
			update.mockResolvedValue({});

			const result = await createService().cancelBankTransfer({
				contributorId: 'contributor-1',
				subscriptionId: 'sub-bank',
				reason: 'other',
			});

			expect(result).toEqual({ success: true, data: undefined });
			expect(update).toHaveBeenCalledWith({
				where: { id: 'sub-bank' },
				data: {
					status: SubscriptionStatus.canceled,
					canceledAt: new Date('2026-03-01T12:00:00.000Z'),
					cancellationReason: 'other',
				},
			});
		});

		it('rejects ended subscriptions', async () => {
			findFirst.mockResolvedValue({ id: 'sub-bank', status: SubscriptionStatus.ended });

			const result = await createService().cancelBankTransfer({
				contributorId: 'contributor-1',
				subscriptionId: 'sub-bank',
				reason: 'other',
			});

			expect(result).toEqual({ success: false, error: 'Subscription not found' });
			expect(update).not.toHaveBeenCalled();
		});
	});
});
