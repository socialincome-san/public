import { SubscriptionStatus } from '@/generated/prisma/enums';
import {
	cancelStripeSubscription,
	listOpenStripeInvoices,
	retrieveStripeSubscription,
	voidStripeInvoice,
} from '@/integrations/stripe/stripe.integration';
import * as stripePaymentRepository from './stripe-payment.repository';
import { cancelContributorSubscription } from './stripe-payment.service';

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
	mapStripeSubscriptionLifecycle: (subscription: { status: string; canceled_at?: number | null }) => {
		if (subscription.status === 'incomplete' || subscription.status === 'incomplete_expired') {
			return null;
		}
		if (subscription.status === 'canceled') {
			return {
				status: 'ended',
				canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
			};
		}
		if (
			subscription.status === 'active' ||
			subscription.status === 'trialing' ||
			subscription.status === 'past_due' ||
			subscription.status === 'unpaid' ||
			subscription.status === 'paused'
		) {
			return {
				status: 'active',
				canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
			};
		}

		return null;
	},
	resolveStripeResourceId: (value: string | { id: string } | null | undefined) =>
		typeof value === 'string' ? value : (value?.id ?? null),
	resolveStripeSubscriptionCanceledAt: (subscription: { canceled_at?: number | null }) =>
		subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : new Date(),
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
	findOwnedStripeSubscription: jest.fn(),
	updateOwnedStripeSubscriptionCancellation: jest.fn(),
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
const mockCancelStripeSubscription = cancelStripeSubscription as jest.Mock;
const mockListOpenStripeInvoices = listOpenStripeInvoices as jest.Mock;
const mockVoidStripeInvoice = voidStripeInvoice as jest.Mock;
const mockFindOwnedStripeSubscription = stripePaymentRepository.findOwnedStripeSubscription as jest.Mock;
const mockUpdateOwnedStripeSubscriptionCancellation =
	stripePaymentRepository.updateOwnedStripeSubscriptionCancellation as jest.Mock;

const canceledStripeSubscription = {
	id: 'sub_stripe_1',
	status: 'canceled',
	canceled_at: 1_700_200_000,
	ended_at: 1_700_200_000,
	items: { data: [] },
};

describe('cancelContributorSubscription', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindOwnedStripeSubscription.mockResolvedValue({
			id: 'sub_db_1',
			stripeSubscriptionId: 'sub_stripe_1',
			status: SubscriptionStatus.active,
		});
		mockRetrieveStripeSubscription.mockResolvedValue({
			success: true,
			data: {
				id: 'sub_stripe_1',
				status: 'active',
				cancel_at_period_end: false,
				items: { data: [{ current_period_end: 1_700_200_000 }] },
			},
		});
		mockCancelStripeSubscription.mockResolvedValue({ success: true, data: canceledStripeSubscription });
		mockListOpenStripeInvoices.mockResolvedValue({ success: true, data: [{ id: 'in_open_1' }] });
		mockVoidStripeInvoice.mockResolvedValue({ success: true, data: undefined });
		mockUpdateOwnedStripeSubscriptionCancellation.mockResolvedValue({ id: 'sub_db_1' });
	});

	test('cancels immediately, voids open invoices, and persists reason', async () => {
		const result = await cancelContributorSubscription({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			reason: 'financial_situation_changed',
		});

		expect(result.success).toBe(true);
		expect(mockFindOwnedStripeSubscription).toHaveBeenCalledWith('contributor_1', 'sub_db_1');
		expect(mockListOpenStripeInvoices).toHaveBeenCalledWith('sub_stripe_1');
		expect(mockVoidStripeInvoice).toHaveBeenCalledWith('in_open_1');
		expect(mockCancelStripeSubscription).toHaveBeenCalledWith('sub_stripe_1', 'too_expensive');
		expect(mockUpdateOwnedStripeSubscriptionCancellation).toHaveBeenCalledTimes(1);
		expect(mockUpdateOwnedStripeSubscriptionCancellation).toHaveBeenCalledWith({
			id: 'sub_db_1',
			status: SubscriptionStatus.ended,
			cancellationReason: 'financial_situation_changed',
			canceledAt: new Date(1_700_200_000 * 1000),
		});
	});

	test('cancels immediately even when stripe was already scheduled for period-end cancellation', async () => {
		mockRetrieveStripeSubscription.mockResolvedValueOnce({
			success: true,
			data: {
				id: 'sub_stripe_1',
				status: 'active',
				cancel_at_period_end: true,
				items: { data: [{ current_period_end: 1_700_300_000 }] },
			},
		});

		const result = await cancelContributorSubscription({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			reason: 'other',
		});

		expect(result.success).toBe(true);
		expect(mockCancelStripeSubscription).toHaveBeenCalledTimes(1);
	});

	test('syncs db without calling stripe cancel when already canceled remotely', async () => {
		mockRetrieveStripeSubscription.mockResolvedValueOnce({
			success: true,
			data: canceledStripeSubscription,
		});

		const result = await cancelContributorSubscription({
			contributorId: 'contributor_1',
			subscriptionId: 'sub_db_1',
			reason: 'other',
		});

		expect(result.success).toBe(true);
		expect(mockCancelStripeSubscription).not.toHaveBeenCalled();
		expect(mockVoidStripeInvoice).not.toHaveBeenCalled();
		expect(mockUpdateOwnedStripeSubscriptionCancellation).toHaveBeenCalledTimes(1);
	});

	test('fails when subscription is not found', async () => {
		mockFindOwnedStripeSubscription.mockResolvedValueOnce(null);

		const result = await cancelContributorSubscription({
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
