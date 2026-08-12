import { PrismaClient, SubscriptionPaymentMethod, SubscriptionStatus } from '@/generated/prisma/client';
import type { CampaignReadService } from '../campaign/campaign-read.service';
import type { ContributionWriteService } from '../contribution/contribution-write.service';
import type { ContributorReadService } from '../contributor/contributor-read.service';
import type { ContributorWriteService } from '../contributor/contributor-write.service';
import type { ProgramAccessReadService } from '../program-access/program-access-read.service';
import type { SubscriptionWriteService } from '../subscription/subscription-write.service';
import { StripeService } from './stripe.service';

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
	ContributionStatus: {},
	ContributorReferralSource: {},
	PaymentEventType: {},
}));

const stripeSubscriptionWithPeriodEnd = {
	id: 'sub_stripe_1',
	cancel_at_period_end: false,
	items: { data: [{ current_period_end: 1_700_200_000 }] },
};

describe('StripeService.cancelContributorSubscription', () => {
	const subscriptionsUpdate = jest.fn().mockResolvedValue({
		id: 'sub_stripe_1',
		cancel_at_period_end: true,
		items: { data: [{ current_period_end: 1_700_200_000 }] },
	});
	const subscriptionsRetrieve = jest.fn().mockResolvedValue(stripeSubscriptionWithPeriodEnd);

	const findFirst = jest.fn().mockResolvedValue({
		id: 'sub_db_1',
		stripeSubscriptionId: 'sub_stripe_1',
		status: SubscriptionStatus.active,
	});
	const subscriptionUpdate = jest.fn().mockResolvedValue({});

	const db = {
		subscription: {
			findFirst,
			update: subscriptionUpdate,
		},
	} as unknown as PrismaClient;

	const createService = () =>
		new StripeService(
			db,
			{} as ContributorReadService,
			{} as ContributorWriteService,
			{} as ContributionWriteService,
			{} as SubscriptionWriteService,
			{} as CampaignReadService,
			{} as ProgramAccessReadService,
			{
				error: jest.fn(),
				warn: jest.fn(),
				info: jest.fn(),
				debug: jest.fn(),
				alert: jest.fn(),
			},
		);

	beforeEach(() => {
		jest.clearAllMocks();
		subscriptionsRetrieve.mockResolvedValue(stripeSubscriptionWithPeriodEnd);
		subscriptionsUpdate.mockResolvedValue({
			id: 'sub_stripe_1',
			cancel_at_period_end: true,
			items: { data: [{ current_period_end: 1_700_200_000 }] },
		});
		(StripeService as unknown as { stripeClient: unknown }).stripeClient = {
			subscriptions: {
				retrieve: subscriptionsRetrieve,
				update: subscriptionsUpdate,
			},
		};
	});

	afterEach(() => {
		(StripeService as unknown as { stripeClient: unknown }).stripeClient = undefined;
	});

	test('cancels at period end and persists reason', async () => {
		const service = createService();
		const result = await service.cancelContributorSubscription({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			reason: 'financial_situation_changed',
		});

		expect(result.success).toBe(true);
		expect(findFirst).toHaveBeenCalledWith({
			where: {
				id: 'sub_db_1',
				contributorId: 'contributor_1',
				paymentMethod: SubscriptionPaymentMethod.stripe,
			},
			select: {
				id: true,
				stripeSubscriptionId: true,
				status: true,
			},
		});
		expect(subscriptionsUpdate).toHaveBeenCalledWith('sub_stripe_1', {
			cancel_at_period_end: true,
			cancellation_details: {
				feedback: 'too_expensive',
			},
		});
		expect(subscriptionUpdate).toHaveBeenCalledTimes(1);
		const [[{ where, data }]] = subscriptionUpdate.mock.calls as [
			[{ where: { id: string }; data: { status: string; cancellationReason: string; canceledAt: Date } }],
		];
		expect(where).toEqual({ id: 'sub_db_1' });
		expect(data.status).toBe(SubscriptionStatus.canceled);
		expect(data.cancellationReason).toBe('financial_situation_changed');
		expect(data.canceledAt).toEqual(new Date(1_700_200_000 * 1000));
	});

	test('syncs db when stripe is already scheduled for cancellation', async () => {
		subscriptionsRetrieve.mockResolvedValueOnce({
			id: 'sub_stripe_1',
			cancel_at_period_end: true,
			items: { data: [{ current_period_end: 1_700_300_000 }] },
		});
		const service = createService();
		const result = await service.cancelContributorSubscription({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			reason: 'other',
		});

		expect(result.success).toBe(true);
		expect(subscriptionsUpdate).not.toHaveBeenCalled();
		const [[{ data }]] = subscriptionUpdate.mock.calls as [
			[{ where: { id: string }; data: { status: string; cancellationReason: string; canceledAt: Date } }],
		];
		expect(data.cancellationReason).toBe('other');
		expect(data.canceledAt).toEqual(new Date(1_700_300_000 * 1000));
	});

	test('fails when subscription is not found', async () => {
		findFirst.mockResolvedValueOnce(null);
		const service = createService();
		const result = await service.cancelContributorSubscription({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_missing',
			reason: 'other',
		});

		expect(result.success).toBe(false);
		if (result.success) {
			throw new Error('Expected failure');
		}
		expect(result.error).toBe('Subscription not found');
	});
});
