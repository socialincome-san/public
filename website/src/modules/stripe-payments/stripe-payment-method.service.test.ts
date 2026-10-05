import {
	createStripeBillingPortalSession,
	listStripeSubscriptions,
	retrieveStripeCustomer,
	updateStripeSubscription,
} from '@/integrations/stripe/stripe.integration';
import * as stripePaymentRepository from './stripe-payment.repository';
import {
	applyCustomerDefaultPaymentMethodToOwnedSubscription,
	createManageSubscriptionsSession,
} from './stripe-payment.service';
import { APPLY_PAYMENT_METHOD_QUERY_PARAM } from './stripe-payment.types';

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

const mockFindOwnedActiveStripeSubscription = stripePaymentRepository.findOwnedActiveStripeSubscription as jest.Mock;
const mockRetrieveStripeCustomer = retrieveStripeCustomer as jest.Mock;
const mockListStripeSubscriptions = listStripeSubscriptions as jest.Mock;
const mockUpdateStripeSubscription = updateStripeSubscription as jest.Mock;
const mockCreateStripeBillingPortalSession = createStripeBillingPortalSession as jest.Mock;

describe('Stripe payment method update', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.BASE_URL = 'https://socialincome.org';
		mockFindOwnedActiveStripeSubscription.mockResolvedValue({
			id: 'sub_db_1',
			campaignId: 'campaign_1',
			currency: 'CHF',
			stripeSubscriptionId: 'sub_stripe_1',
		});
		mockRetrieveStripeCustomer.mockResolvedValue({
			success: true,
			data: {
				id: 'cus_1',
				invoice_settings: { default_payment_method: 'pm_new' },
			},
		});
		mockListStripeSubscriptions.mockResolvedValue({
			success: true,
			data: [
				{ id: 'sub_stripe_1', default_payment_method: 'pm_old' },
				{ id: 'sub_stripe_2', default_payment_method: 'pm_new' },
			],
		});
		mockUpdateStripeSubscription.mockResolvedValue({ success: true, data: { id: 'sub_stripe_1' } });
		mockCreateStripeBillingPortalSession.mockResolvedValue({
			success: true,
			data: 'https://billing.stripe.com/session',
		});
	});

	test('opens a payment method portal session that returns to apply the new default', async () => {
		const result = await createManageSubscriptionsSession({
			stripeCustomerId: 'cus_1',
			language: 'en',
			flow: 'payment_method_update',
			subscriptionId: 'sub_db_1',
		});

		expect(result).toEqual({ success: true, data: 'https://billing.stripe.com/session' });
		expect(mockCreateStripeBillingPortalSession).toHaveBeenCalledWith({
			customerId: 'cus_1',
			returnUrl: `https://socialincome.org/dashboard/subscriptions?${APPLY_PAYMENT_METHOD_QUERY_PARAM}=sub_db_1`,
			locale: 'en',
			flow: 'payment_method_update',
		});
	});

	test('copies the customer default payment method onto subscriptions that still use the old card', async () => {
		const result = await applyCustomerDefaultPaymentMethodToOwnedSubscription({
			contributorId: 'contributor_1',
			stripeCustomerId: 'cus_1',
			subscriptionId: 'sub_db_1',
		});

		expect(result).toEqual({ success: true, data: undefined });
		expect(mockFindOwnedActiveStripeSubscription).toHaveBeenCalledWith('contributor_1', 'sub_db_1');
		expect(mockUpdateStripeSubscription).toHaveBeenCalledTimes(1);
		expect(mockUpdateStripeSubscription).toHaveBeenCalledWith('sub_stripe_1', {
			defaultPaymentMethod: 'pm_new',
		});
	});

	test('does not update Stripe when the owned subscription is missing', async () => {
		mockFindOwnedActiveStripeSubscription.mockResolvedValueOnce(null);

		const result = await applyCustomerDefaultPaymentMethodToOwnedSubscription({
			contributorId: 'contributor_1',
			stripeCustomerId: 'cus_1',
			subscriptionId: 'sub_db_1',
		});

		expect(result.success).toBe(false);
		expect(mockRetrieveStripeCustomer).not.toHaveBeenCalled();
		expect(mockUpdateStripeSubscription).not.toHaveBeenCalled();
	});
});
