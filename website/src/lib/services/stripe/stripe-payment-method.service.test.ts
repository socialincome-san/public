import { PrismaClient, SubscriptionPaymentMethod, SubscriptionStatus } from '@/generated/prisma/client';
import type { CampaignReadService } from '../campaign/campaign-read.service';
import type { ContributionWriteService } from '../contribution/contribution-write.service';
import type { ContributorReadService } from '../contributor/contributor-read.service';
import type { ContributorWriteService } from '../contributor/contributor-write.service';
import type { ProgramAccessReadService } from '../program-access/program-access-read.service';
import type { SubscriptionWriteService } from '../subscription/subscription-write.service';
import { StripeService } from './stripe.service';
import { APPLY_PAYMENT_METHOD_QUERY_PARAM } from './stripe.types';

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

describe('StripeService payment method update', () => {
	const findFirst = jest.fn();
	const customersRetrieve = jest.fn();
	const subscriptionsList = jest.fn();
	const subscriptionsUpdate = jest.fn();
	const billingPortalCreate = jest.fn();

	const db = {
		subscription: { findFirst },
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
		process.env.BASE_URL = 'https://socialincome.org';
		findFirst.mockResolvedValue({ id: 'sub_db_1' });
		customersRetrieve.mockResolvedValue({
			id: 'cus_1',
			invoice_settings: { default_payment_method: 'pm_new' },
		});
		subscriptionsList.mockResolvedValue({
			data: [
				{ id: 'sub_stripe_1', default_payment_method: 'pm_old' },
				{ id: 'sub_stripe_2', default_payment_method: 'pm_new' },
			],
		});
		subscriptionsUpdate.mockResolvedValue({});
		billingPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/session' });
		(StripeService as unknown as { stripeClient: unknown }).stripeClient = {
			customers: { retrieve: customersRetrieve },
			subscriptions: {
				list: subscriptionsList,
				update: subscriptionsUpdate,
			},
			billingPortal: {
				sessions: { create: billingPortalCreate },
			},
		};
	});

	afterEach(() => {
		(StripeService as unknown as { stripeClient: unknown }).stripeClient = undefined;
	});

	test('opens a payment method portal session that returns to apply the new default', async () => {
		const result = await createService().createManageSubscriptionsSession({
			stripeCustomerId: 'cus_1',
			language: 'en',
			flow: 'payment_method_update',
			subscriptionId: 'sub_db_1',
		});

		expect(result).toEqual({ success: true, data: 'https://billing.stripe.com/session' });
		expect(billingPortalCreate).toHaveBeenCalledWith({
			customer: 'cus_1',
			return_url: `https://socialincome.org/dashboard/subscriptions?${APPLY_PAYMENT_METHOD_QUERY_PARAM}=sub_db_1`,
			locale: 'en',
			flow_data: { type: 'payment_method_update' },
		});
	});

	test('copies the customer default payment method onto subscriptions that still use the old card', async () => {
		const result = await createService().applyCustomerDefaultPaymentMethodToOwnedSubscription({
			contributorId: 'contributor_1',
			stripeCustomerId: 'cus_1',
			subscriptionId: 'sub_db_1',
		});

		expect(result).toEqual({ success: true, data: undefined });
		expect(findFirst).toHaveBeenCalledWith({
			where: {
				id: 'sub_db_1',
				contributorId: 'contributor_1',
				paymentMethod: SubscriptionPaymentMethod.stripe,
				status: SubscriptionStatus.active,
			},
			select: { id: true },
		});
		expect(subscriptionsUpdate).toHaveBeenCalledTimes(1);
		expect(subscriptionsUpdate).toHaveBeenCalledWith('sub_stripe_1', {
			default_payment_method: 'pm_new',
		});
	});

	test('does not update Stripe when the owned subscription is missing', async () => {
		findFirst.mockResolvedValueOnce(null);

		const result = await createService().applyCustomerDefaultPaymentMethodToOwnedSubscription({
			contributorId: 'contributor_1',
			stripeCustomerId: 'cus_1',
			subscriptionId: 'sub_db_1',
		});

		expect(result.success).toBe(false);
		expect(customersRetrieve).not.toHaveBeenCalled();
		expect(subscriptionsUpdate).not.toHaveBeenCalled();
	});
});
