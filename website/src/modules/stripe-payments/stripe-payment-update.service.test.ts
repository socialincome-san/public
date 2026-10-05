import {
	createStripePrice,
	retrieveStripeSubscription,
	updateStripeSubscription,
} from '@/integrations/stripe/stripe.integration';
import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import * as stripePaymentRepository from './stripe-payment.repository';
import { updateContributorSubscriptionAmount } from './stripe-payment.service';

jest.mock('@/integrations/stripe/stripe.integration', () => ({
	cancelStripeSubscription: jest.fn(),
	constructStripeWebhookEvent: jest.fn(),
	createStripeBillingPortalSession: jest.fn(),
	createStripeCheckoutSession: jest.fn(),
	createStripeCustomer: jest.fn(),
	createStripePrice: jest.fn(),
	getStripeBalanceTransaction: jest.fn(),
	listOpenStripeInvoices: jest.fn(),
	listStripeCheckoutSessionsByPaymentIntent: jest.fn(),
	listStripeSubscriptions: jest.fn(),
	mapStripeRecurringInterval: (interval: string, intervalCount: number) =>
		interval === 'month' && intervalCount === 1 ? 'monthly' : null,
	mapStripeSubscriptionFields: (subscription: {
		status: string;
		canceled_at?: number | null;
		items: {
			data: {
				price?: {
					unit_amount?: number | null;
					currency: string;
					recurring?: { interval: string; interval_count: number } | null;
				} | null;
			}[];
		};
		metadata?: Record<string, string>;
	}) => {
		if (subscription.status === 'incomplete' || subscription.status === 'incomplete_expired') {
			return null;
		}
		const price = subscription.items.data[0]?.price;
		if (!price?.recurring || price.unit_amount === null || price.unit_amount === undefined || price.unit_amount < 0) {
			return null;
		}
		if (price.recurring.interval !== 'month' || price.recurring.interval_count !== 1) {
			return null;
		}

		return {
			status: subscription.status === 'canceled' ? 'ended' : 'active',
			canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
			amount: price.unit_amount / 100,
			currency: price.currency.toUpperCase(),
			interval: 'monthly',
		};
	},
	resolveStripeResourceId: (value: string | { id: string } | null | undefined) =>
		typeof value === 'string' ? value : (value?.id ?? null),
	retrieveStripeCharge: jest.fn(),
	retrieveStripeCheckoutSession: jest.fn(),
	retrieveStripeCustomer: jest.fn(),
	retrieveStripePaymentMethod: jest.fn(),
	retrieveStripeSubscription: jest.fn(),
	retrieveStripeSubscriptionForCharge: jest.fn(),
	updateStripeSubscription: jest.fn(),
	voidStripeInvoice: jest.fn(),
}));

jest.mock('./stripe-payment.repository', () => ({
	findOwnedActiveStripeSubscription: jest.fn(),
	updateStripeSubscriptionFromStripe: jest.fn(),
}));

jest.mock('@/modules/campaigns/campaign.service', () => ({
	getCampaignById: jest.fn(),
	getDefaultCampaignForProgram: jest.fn(),
	getFallbackCampaign: jest.fn(),
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorByAccountId: jest.fn(),
	findContributorByStripeCustomerOrEmail: jest.fn(),
	getOrCreateContributorForAccount: jest.fn(),
	getOrCreateContributorWithFirebaseAuth: jest.fn(),
	updateContributorSelf: jest.fn(),
}));

jest.mock('@/modules/contributions/contribution.service', () => ({
	upsertFromStripeEvent: jest.fn(),
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: jest.fn(),
}));

jest.mock('@/modules/users/user.service', () => ({
	getUserContactIdByAccountId: jest.fn(),
	getUserStripeCheckoutContext: jest.fn(),
}));

const mockRetrieveStripeSubscription = retrieveStripeSubscription as jest.Mock;
const mockCreateStripePrice = createStripePrice as jest.Mock;
const mockUpdateStripeSubscription = updateStripeSubscription as jest.Mock;
const mockFindOwnedActiveStripeSubscription = stripePaymentRepository.findOwnedActiveStripeSubscription as jest.Mock;
const mockUpsertStripeSubscription = stripePaymentRepository.updateStripeSubscriptionFromStripe as jest.Mock;

const monthlyPrice = {
	id: 'price_old',
	currency: 'chf',
	unit_amount: 3000,
	product: 'prod_1',
	recurring: { interval: 'month', interval_count: 1 },
};

describe('updateContributorSubscriptionAmount', () => {
	const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

	beforeEach(() => {
		jest.clearAllMocks();
		mockFindOwnedActiveStripeSubscription.mockResolvedValue({
			id: 'sub_db_1',
			campaignId: 'campaign_1',
			currency: 'CHF',
			stripeSubscriptionId: 'sub_stripe_1',
		});
		mockRetrieveStripeSubscription.mockResolvedValue({
			success: true,
			data: {
				id: 'sub_stripe_1',
				status: 'active',
				canceled_at: null,
				items: { data: [{ id: 'si_1', price: monthlyPrice }] },
				metadata: {},
			},
		});
		mockCreateStripePrice.mockResolvedValue({ success: true, data: { id: 'price_new' } });
		mockUpdateStripeSubscription.mockResolvedValue({
			success: true,
			data: {
				id: 'sub_stripe_1',
				status: 'active',
				canceled_at: null,
				items: { data: [{ id: 'si_1', price: { ...monthlyPrice, unit_amount: 5000 } }] },
				metadata: {},
			},
		});
		mockUpsertStripeSubscription.mockResolvedValue({
			id: 'sub_db_1',
			stripeSubscriptionId: 'sub_stripe_1',
			campaignId: 'campaign_1',
			status: 'active',
		});
	});

	afterAll(() => {
		consoleError.mockRestore();
	});

	test('creates a monthly price in cents and updates the subscription item', async () => {
		const result = await updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result).toEqual({ success: true, data: { amount: 50, currency: 'CHF' } });
		expect(mockFindOwnedActiveStripeSubscription).toHaveBeenCalledWith('contributor_1', 'sub_db_1');
		expect(mockCreateStripePrice).toHaveBeenCalledWith({
			currency: 'chf',
			productId: 'prod_1',
			unitAmount: 5000,
		});
		expect(mockUpdateStripeSubscription).toHaveBeenCalledWith('sub_stripe_1', {
			items: [{ id: 'si_1', price: 'price_new' }],
			prorationBehavior: 'none',
		});
		expect(mockUpsertStripeSubscription).toHaveBeenCalledWith(
			expect.objectContaining({
				stripeSubscriptionId: 'sub_stripe_1',
				contributorId: 'contributor_1',
				campaignId: 'campaign_1',
			}),
		);
	});

	test('rejects non-monthly intervals before writing to Stripe', async () => {
		mockRetrieveStripeSubscription.mockResolvedValueOnce({
			success: true,
			data: {
				id: 'sub_stripe_1',
				status: 'active',
				canceled_at: null,
				items: {
					data: [
						{
							id: 'si_1',
							price: { ...monthlyPrice, recurring: { interval: 'year', interval_count: 1 } },
						},
					],
				},
				metadata: {},
			},
		});

		const result = await updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result.success).toBe(false);
		expect(mockCreateStripePrice).not.toHaveBeenCalled();
		expect(mockUpdateStripeSubscription).not.toHaveBeenCalled();
	});

	test('rejects currency mismatches between database and Stripe', async () => {
		mockRetrieveStripeSubscription.mockResolvedValueOnce({
			success: true,
			data: {
				id: 'sub_stripe_1',
				status: 'active',
				canceled_at: null,
				items: { data: [{ id: 'si_1', price: { ...monthlyPrice, currency: 'eur' } }] },
				metadata: {},
			},
		});

		const result = await updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result.success).toBe(false);
		expect(mockCreateStripePrice).not.toHaveBeenCalled();
	});

	test('alerts when Stripe update succeeds but database sync fails', async () => {
		mockUpsertStripeSubscription.mockRejectedValueOnce(new Error('sync failed'));

		const result = await updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result.success).toBe(false);
		expect(consoleError).toHaveBeenCalledWith(
			`${SLACK_ALERT}: Stripe subscription amount updated but database sync failed`,
			expect.objectContaining({
				subscriptionId: 'sub_db_1',
				stripeSubscriptionId: 'sub_stripe_1',
			}),
		);
		expect(mockUpdateStripeSubscription).toHaveBeenCalled();
	});

	test('syncs Prisma when Stripe already has the requested amount', async () => {
		mockRetrieveStripeSubscription.mockResolvedValueOnce({
			success: true,
			data: {
				id: 'sub_stripe_1',
				status: 'active',
				canceled_at: null,
				items: { data: [{ id: 'si_1', price: { ...monthlyPrice, unit_amount: 5000 } }] },
				metadata: {},
			},
		});

		const result = await updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result).toEqual({ success: true, data: { amount: 50, currency: 'CHF' } });
		expect(mockCreateStripePrice).not.toHaveBeenCalled();
		expect(mockUpdateStripeSubscription).not.toHaveBeenCalled();
		expect(mockUpsertStripeSubscription).toHaveBeenCalledWith(
			expect.objectContaining({
				stripeSubscriptionId: 'sub_stripe_1',
				contributorId: 'contributor_1',
				campaignId: 'campaign_1',
			}),
		);
	});

	test('fails retry when Stripe already matches but database sync fails', async () => {
		mockRetrieveStripeSubscription.mockResolvedValueOnce({
			success: true,
			data: {
				id: 'sub_stripe_1',
				status: 'active',
				canceled_at: null,
				items: { data: [{ id: 'si_1', price: { ...monthlyPrice, unit_amount: 5000 } }] },
				metadata: {},
			},
		});
		mockUpsertStripeSubscription.mockRejectedValueOnce(new Error('sync failed'));

		const result = await updateContributorSubscriptionAmount({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			amount: 50,
		});

		expect(result.success).toBe(false);
		expect(consoleError).toHaveBeenCalledWith(
			`${SLACK_ALERT}: Stripe subscription amount updated but database sync failed`,
			expect.objectContaining({
				subscriptionId: 'sub_db_1',
				stripeSubscriptionId: 'sub_stripe_1',
			}),
		);
		expect(mockCreateStripePrice).not.toHaveBeenCalled();
		expect(mockUpdateStripeSubscription).not.toHaveBeenCalled();
	});
});
