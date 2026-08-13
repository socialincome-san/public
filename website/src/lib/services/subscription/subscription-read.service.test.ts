import { PrismaClient, SubscriptionPaymentMethod } from '@/generated/prisma/client';
import type { ContributionReadService } from '../contribution/contribution-read.service';
import type { ServiceResult } from '../core/base.types';
import type { StripeService } from '../stripe/stripe.service';
import { UPCOMING_PAYMENTS_PER_SUBSCRIPTION } from './subscription-payment-schedule';
import { SubscriptionReadService } from './subscription-read.service';

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
}));

jest.mock('@/lib/utils/now', () => ({
	now: jest.fn(() => new Date('2026-01-15T12:00:00.000Z')),
}));

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const createService = ({
	subscriptions = [],
	stripeDetails = null as { brand?: string; last4?: string; currentPeriodEnd: Date | null } | null,
	loggerInstance = {
		error: jest.fn(),
		warn: jest.fn(),
		info: jest.fn(),
		debug: jest.fn(),
		alert: jest.fn(),
	},
}: {
	subscriptions?: {
		id: string;
		amount: unknown;
		currency: 'CHF' | 'EUR' | 'USD';
		createdAt: Date;
		paymentMethod: 'stripe' | 'bank_transfer';
		stripeSubscriptionId: string | null;
		bankStandingOrderReference?: string | null;
		contributor?: { paymentReferenceId: string | null };
	}[];
	stripeDetails?: { brand?: string; last4?: string; currentPeriodEnd: Date | null } | null;
	loggerInstance?: {
		error: jest.Mock;
		warn: jest.Mock;
		info: jest.Mock;
		debug: jest.Mock;
		alert: jest.Mock;
	};
} = {}) => {
	const db = {
		subscription: {
			findMany: jest.fn().mockResolvedValue(
				subscriptions.map((subscription) => ({
					bankStandingOrderReference: null,
					contributor: { paymentReferenceId: null },
					...subscription,
				})),
			),
		},
	} as unknown as PrismaClient;

	const contributionReadService = {
		getContributorContributionSummary: jest.fn().mockResolvedValue({
			success: true as const,
			data: { totalAmountChf: 750, count: 15, firstContributionAt: new Date('2024-11-03T00:00:00.000Z') },
		}),
	} as unknown as ContributionReadService;

	return {
		service: new SubscriptionReadService(
			db,
			contributionReadService,
			{ getSubscriptionStripeDetails: jest.fn().mockResolvedValue(stripeDetails) } as unknown as StripeService,
			loggerInstance,
		),
		loggerInstance,
	};
};

describe('SubscriptionReadService', () => {
	it('omits qr bill when bank transfer references are incomplete or currency is unsupported', async () => {
		const incomplete = createService({
			subscriptions: [
				{
					id: 'sub-bank-missing-ref',
					amount: 50,
					currency: 'CHF',
					createdAt: new Date('2024-11-01T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.bank_transfer,
					stripeSubscriptionId: null,
					bankStandingOrderReference: null,
					contributor: { paymentReferenceId: '1735689600000' },
				},
			],
		});
		const unsupportedCurrency = createService({
			subscriptions: [
				{
					id: 'sub-bank-usd',
					amount: 50,
					currency: 'USD',
					createdAt: new Date('2024-11-01T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.bank_transfer,
					stripeSubscriptionId: null,
					bankStandingOrderReference: '1731700000',
					contributor: { paymentReferenceId: '1735689600000' },
				},
			],
		});

		expect(
			expectSuccess(await incomplete.service.getDashboardView('contributor-1')).activeSubscriptions[0]?.paymentDisplay,
		).toEqual({
			type: 'bank_transfer',
			qrBill: null,
		});
		expect(
			expectSuccess(await unsupportedCurrency.service.getDashboardView('contributor-1')).activeSubscriptions[0]
				?.paymentDisplay,
		).toEqual({ type: 'bank_transfer', qrBill: null });
	});

	it('returns null monthly total for mixed currencies', async () => {
		const { service } = createService({
			subscriptions: [
				{
					id: 'sub-1',
					amount: 20,
					currency: 'CHF',
					createdAt: new Date('2024-11-01T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.bank_transfer,
					stripeSubscriptionId: null,
				},
				{
					id: 'sub-2',
					amount: 30,
					currency: 'EUR',
					createdAt: new Date('2025-01-15T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.stripe,
					stripeSubscriptionId: 'sub_123',
				},
			],
		});

		expect(expectSuccess(await service.getDashboardView('contributor-1')).monthlyContribution).toEqual({
			totalAmount: null,
			currency: null,
			activeCount: 2,
		});
	});

	it('schedules stripe upcoming payments from currentPeriodEnd', async () => {
		const { service } = createService({
			subscriptions: [
				{
					id: 'sub-stripe',
					amount: 30,
					currency: 'CHF',
					createdAt: new Date('2024-09-01T10:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.stripe,
					stripeSubscriptionId: 'sub_123',
				},
			],
			stripeDetails: { brand: 'Visa', last4: '4242', currentPeriodEnd: new Date('2026-03-05T00:00:00.000Z') },
		});

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(data.upcomingPayments).toHaveLength(UPCOMING_PAYMENTS_PER_SUBSCRIPTION);
		expect(data.upcomingPayments.map((payment) => payment.scheduledAt.toISOString())).toEqual([
			'2026-03-05T00:00:00.000Z',
			'2026-04-05T00:00:00.000Z',
			'2026-05-05T00:00:00.000Z',
			'2026-06-05T00:00:00.000Z',
		]);
	});

	it('skips stripe upcoming payments when details or currentPeriodEnd are missing', async () => {
		const missingDetails = createService({
			subscriptions: [
				{
					id: 'sub-stripe',
					amount: 30,
					currency: 'CHF',
					createdAt: new Date('2024-09-01T10:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.stripe,
					stripeSubscriptionId: 'sub_123',
				},
			],
			stripeDetails: null,
		});
		const missingPeriodEnd = createService({
			subscriptions: [
				{
					id: 'sub-stripe',
					amount: 30,
					currency: 'CHF',
					createdAt: new Date('2024-09-01T10:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.stripe,
					stripeSubscriptionId: 'sub_123',
				},
			],
			stripeDetails: { brand: 'Visa', last4: '4242', currentPeriodEnd: null },
		});

		expect(expectSuccess(await missingDetails.service.getDashboardView('contributor-1')).upcomingPayments).toEqual([]);
		expect(missingDetails.loggerInstance.warn).toHaveBeenCalledWith('Skipping upcoming payments for Stripe subscription', {
			subscriptionId: 'sub-stripe',
			stripeSubscriptionId: 'sub_123',
			reason: 'stripe_details_unavailable',
		});
		expect(expectSuccess(await missingPeriodEnd.service.getDashboardView('contributor-1')).upcomingPayments).toEqual([]);
		expect(missingPeriodEnd.loggerInstance.warn).toHaveBeenCalledWith('Skipping upcoming payments for Stripe subscription', {
			subscriptionId: 'sub-stripe',
			stripeSubscriptionId: 'sub_123',
			reason: 'current_period_end_missing',
		});
	});
});
