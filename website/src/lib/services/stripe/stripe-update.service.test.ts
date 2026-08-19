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
		ended: 'ended',
	},
	ContributionStatus: {},
	ContributorReferralSource: {},
	PaymentEventType: {},
}));

const monthlyPrice = {
	id: 'price_old',
	currency: 'chf',
	unit_amount: 3000,
	product: 'prod_1',
	recurring: { interval: 'month', interval_count: 1 },
};

describe('StripeService.updateContributorSubscriptionAmount', () => {
	const subscriptionsRetrieve = jest.fn();
	const subscriptionsUpdate = jest.fn();
	const pricesCreate = jest.fn();
	const findFirst = jest.fn();
	const upsertFromStripeSubscription = jest.fn();
	const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

	const db = {
		subscription: { findFirst },
	} as unknown as PrismaClient;

	const createService = () =>
		new StripeService(
			db,
			{} as ContributorReadService,
			{} as ContributorWriteService,
			{} as ContributionWriteService,
			{ upsertFromStripeSubscription } as unknown as SubscriptionWriteService,
			{} as CampaignReadService,
			{} as ProgramAccessReadService,
		);

	beforeEach(() => {
		jest.clearAllMocks();
		findFirst.mockResolvedValue({
			id: 'sub_db_1',
			campaignId: 'campaign_1',
			currency: 'CHF',
			stripeSubscriptionId: 'sub_stripe_1',
		});
		subscriptionsRetrieve.mockResolvedValue({
			id: 'sub_stripe_1',
			items: { data: [{ id: 'si_1', price: monthlyPrice }] },
		});
		pricesCreate.mockResolvedValue({ id: 'price_new' });
		subscriptionsUpdate.mockResolvedValue({ id: 'sub_stripe_1' });
		upsertFromStripeSubscription.mockResolvedValue({
			success: true,
			data: { id: 'sub_db_1' },
		});
		(StripeService as unknown as { stripeClient: unknown }).stripeClient = {
			subscriptions: {
				retrieve: subscriptionsRetrieve,
				update: subscriptionsUpdate,
			},
			prices: {
				create: pricesCreate,
			},
		};
	});

	afterEach(() => {
		(StripeService as unknown as { stripeClient: unknown }).stripeClient = undefined;
	});

	afterAll(() => {
		consoleError.mockRestore();
	});

	test('creates a monthly price in cents and updates the subscription item', async () => {
		const result = await createService().updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result).toEqual({ success: true, data: { amount: 50, currency: 'CHF' } });
		expect(findFirst).toHaveBeenCalledWith({
			where: {
				id: 'sub_db_1',
				contributorId: 'contributor_1',
				paymentMethod: SubscriptionPaymentMethod.stripe,
				status: SubscriptionStatus.active,
			},
			select: {
				id: true,
				campaignId: true,
				currency: true,
				stripeSubscriptionId: true,
			},
		});
		expect(pricesCreate).toHaveBeenCalledWith({
			currency: 'chf',
			product: 'prod_1',
			unit_amount: 5000,
			recurring: { interval: 'month', interval_count: 1 },
		});
		expect(subscriptionsUpdate).toHaveBeenCalledWith('sub_stripe_1', {
			items: [{ id: 'si_1', price: 'price_new' }],
			proration_behavior: 'none',
		});
		expect(upsertFromStripeSubscription).toHaveBeenCalledWith({
			stripeSubscription: { id: 'sub_stripe_1' },
			contributorId: 'contributor_1',
			campaignId: 'campaign_1',
		});
	});

	test('rejects non-monthly intervals before writing to Stripe', async () => {
		subscriptionsRetrieve.mockResolvedValueOnce({
			id: 'sub_stripe_1',
			items: {
				data: [
					{
						id: 'si_1',
						price: { ...monthlyPrice, recurring: { interval: 'year', interval_count: 1 } },
					},
				],
			},
		});

		const result = await createService().updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result.success).toBe(false);
		expect(pricesCreate).not.toHaveBeenCalled();
		expect(subscriptionsUpdate).not.toHaveBeenCalled();
	});

	test('rejects currency mismatches between database and Stripe', async () => {
		subscriptionsRetrieve.mockResolvedValueOnce({
			id: 'sub_stripe_1',
			items: {
				data: [{ id: 'si_1', price: { ...monthlyPrice, currency: 'eur' } }],
			},
		});

		const result = await createService().updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result.success).toBe(false);
		expect(pricesCreate).not.toHaveBeenCalled();
	});

	test('alerts when Stripe update succeeds but database sync fails', async () => {
		upsertFromStripeSubscription.mockResolvedValueOnce({ success: false, error: 'sync failed' });

		const result = await createService().updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result.success).toBe(false);
		expect(consoleError).toHaveBeenCalled();
		expect(subscriptionsUpdate).toHaveBeenCalled();
	});

	test('syncs Prisma when Stripe already has the requested amount', async () => {
		subscriptionsRetrieve.mockResolvedValueOnce({
			id: 'sub_stripe_1',
			items: { data: [{ id: 'si_1', price: { ...monthlyPrice, unit_amount: 5000 } }] },
		});

		const result = await createService().updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result).toEqual({ success: true, data: { amount: 50, currency: 'CHF' } });
		expect(pricesCreate).not.toHaveBeenCalled();
		expect(subscriptionsUpdate).not.toHaveBeenCalled();
		expect(upsertFromStripeSubscription).toHaveBeenCalledWith({
			stripeSubscription: {
				id: 'sub_stripe_1',
				items: { data: [{ id: 'si_1', price: { ...monthlyPrice, unit_amount: 5000 } }] },
			},
			contributorId: 'contributor_1',
			campaignId: 'campaign_1',
		});
	});

	test('fails retry when Stripe already matches but database sync fails', async () => {
		subscriptionsRetrieve.mockResolvedValueOnce({
			id: 'sub_stripe_1',
			items: { data: [{ id: 'si_1', price: { ...monthlyPrice, unit_amount: 5000 } }] },
		});
		upsertFromStripeSubscription.mockResolvedValueOnce({ success: false, error: 'sync failed' });

		const result = await createService().updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result.success).toBe(false);
		expect(consoleError).toHaveBeenCalled();
		expect(pricesCreate).not.toHaveBeenCalled();
		expect(subscriptionsUpdate).not.toHaveBeenCalled();
	});
});
