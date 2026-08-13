import { PrismaClient, SubscriptionPaymentMethod, SubscriptionStatus } from '@/generated/prisma/client';
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
	contributionSummary = { totalAmountChf: 750, count: 15, firstContributionAt: new Date('2024-11-03T00:00:00.000Z') },
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
	contributionSummary?: { totalAmountChf: number; count: number; firstContributionAt: Date | null };
	stripeDetails?: { brand?: string; last4?: string; currentPeriodEnd: Date | null } | null;
	loggerInstance?: {
		error: jest.Mock;
		warn: jest.Mock;
		info: jest.Mock;
		debug: jest.Mock;
		alert: jest.Mock;
	};
} = {}) => {
	const findMany = jest.fn().mockResolvedValue(
		subscriptions.map((subscription) => ({
			bankStandingOrderReference: null,
			contributor: { paymentReferenceId: null },
			...subscription,
		})),
	);
	const db = {
		subscription: { findMany },
	} as unknown as PrismaClient;

	const contributionReadService = {
		getContributorContributionSummary: jest.fn().mockResolvedValue({
			success: true as const,
			data: contributionSummary,
		}),
	} as unknown as ContributionReadService;

	const getSubscriptionStripeDetails = jest.fn().mockResolvedValue(stripeDetails);
	const stripeService = {
		getSubscriptionStripeDetails,
	} as unknown as StripeService;

	return {
		service: new SubscriptionReadService(db, contributionReadService, stripeService, loggerInstance),
		findMany,
		getSubscriptionStripeDetails,
		loggerInstance,
	};
};

describe('SubscriptionReadService', () => {
	it('returns active subscriptions scoped to contributor with bank and stripe rows', async () => {
		const { service, findMany } = createService({
			subscriptions: [
				{
					id: 'sub-bank',
					amount: 50,
					currency: 'CHF',
					createdAt: new Date('2024-11-01T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.bank_transfer,
					stripeSubscriptionId: null,
				},
				{
					id: 'sub-stripe',
					amount: 30,
					currency: 'CHF',
					createdAt: new Date('2025-01-15T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.stripe,
					stripeSubscriptionId: 'sub_123',
				},
			],
			stripeDetails: { brand: 'Visa', last4: '4242', currentPeriodEnd: new Date('2026-03-05T00:00:00.000Z') },
		});

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(findMany).toHaveBeenCalledWith({
			where: { contributorId: 'contributor-1', status: SubscriptionStatus.active },
			select: {
				id: true,
				amount: true,
				currency: true,
				createdAt: true,
				paymentMethod: true,
				stripeSubscriptionId: true,
				bankStandingOrderReference: true,
				contributor: {
					select: { paymentReferenceId: true },
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		expect(data.activeSubscriptions).toHaveLength(2);
		expect(data.activeSubscriptions[0]?.paymentDisplay).toEqual({ type: 'bank_transfer', qrBill: null });
		expect(data.activeSubscriptions[1]?.paymentDisplay).toEqual({
			type: 'stripe',
			brand: 'Visa',
			last4: '4242',
		});
	});

	it('includes qr bill references for bank transfer subscriptions when available', async () => {
		const { service } = createService({
			subscriptions: [
				{
					id: 'sub-bank',
					amount: 50,
					currency: 'CHF',
					createdAt: new Date('2024-11-01T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.bank_transfer,
					stripeSubscriptionId: null,
					bankStandingOrderReference: '1731700000',
					contributor: { paymentReferenceId: '1735689600000' },
				},
			],
		});

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(data.activeSubscriptions[0]?.paymentDisplay).toEqual({
			type: 'bank_transfer',
			qrBill: {
				contributorReferenceId: '1735689600000',
				contributionReferenceId: '1731700000',
			},
		});
	});

	it('omits qr bill when bank transfer references are incomplete', async () => {
		const { service } = createService({
			subscriptions: [
				{
					id: 'sub-bank-missing-contribution-ref',
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

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(data.activeSubscriptions[0]?.paymentDisplay).toEqual({ type: 'bank_transfer', qrBill: null });
	});

	it('omits qr bill when bank transfer currency is unsupported', async () => {
		const { service } = createService({
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

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(data.activeSubscriptions[0]?.paymentDisplay).toEqual({ type: 'bank_transfer', qrBill: null });
	});

	it('builds four upcoming payments per active subscription and merges them chronologically', async () => {
		const { service } = createService({
			subscriptions: [
				{
					id: 'sub-bank',
					amount: 20,
					currency: 'CHF',
					createdAt: new Date('2024-11-07T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.bank_transfer,
					stripeSubscriptionId: null,
				},
				{
					id: 'sub-stripe',
					amount: 30,
					currency: 'CHF',
					createdAt: new Date('2025-01-15T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.stripe,
					stripeSubscriptionId: 'sub_123',
				},
			],
			stripeDetails: { brand: 'Visa', last4: '4242', currentPeriodEnd: new Date('2026-03-05T00:00:00.000Z') },
		});

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(data.upcomingPayments).toHaveLength(UPCOMING_PAYMENTS_PER_SUBSCRIPTION * 2);
		expect(data.upcomingPayments.map((payment) => payment.scheduledAt.toISOString())).toEqual([
			'2026-02-07T00:00:00.000Z',
			'2026-03-05T00:00:00.000Z',
			'2026-03-07T00:00:00.000Z',
			'2026-04-05T00:00:00.000Z',
			'2026-04-07T00:00:00.000Z',
			'2026-05-05T00:00:00.000Z',
			'2026-05-07T00:00:00.000Z',
			'2026-06-05T00:00:00.000Z',
		]);
		expect(data.upcomingPayments.every((payment) => payment.status === 'scheduled')).toBe(true);
	});

	it('sums monthly contribution when all active subscriptions share one currency', async () => {
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
					currency: 'CHF',
					createdAt: new Date('2025-01-15T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.stripe,
					stripeSubscriptionId: 'sub_123',
				},
			],
		});

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(data.monthlyContribution).toEqual({
			totalAmount: 50,
			currency: 'CHF',
			activeCount: 2,
		});
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

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(data.monthlyContribution).toEqual({
			totalAmount: null,
			currency: null,
			activeCount: 2,
		});
	});

	it('returns contribution summary from contribution read service', async () => {
		const { service } = createService({
			subscriptions: [],
			contributionSummary: { totalAmountChf: 0, count: 0, firstContributionAt: null },
		});

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(data.contributionSummary).toEqual({
			totalAmountChf: 0,
			count: 0,
			firstContributionAt: null,
		});
		expect(data.monthlyContribution.activeCount).toBe(0);
		expect(data.upcomingPayments).toEqual([]);
	});

	it('falls back to stripe without last4 when card display is unavailable', async () => {
		const { service, getSubscriptionStripeDetails } = createService({
			subscriptions: [
				{
					id: 'sub-stripe',
					amount: 30,
					currency: 'CHF',
					createdAt: new Date('2025-01-15T00:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.stripe,
					stripeSubscriptionId: 'sub_123',
				},
			],
			stripeDetails: { currentPeriodEnd: new Date('2026-03-05T00:00:00.000Z') },
		});

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(getSubscriptionStripeDetails).toHaveBeenCalledWith('sub_123');
		expect(data.activeSubscriptions[0]?.paymentDisplay).toEqual({ type: 'stripe' });
		expect(data.upcomingPayments).toHaveLength(UPCOMING_PAYMENTS_PER_SUBSCRIPTION);
	});

	it('falls back to createdAt schedule anchor when stripe details are unavailable', async () => {
		const { service, loggerInstance } = createService({
			subscriptions: [
				{
					id: 'sub-stripe',
					amount: 1200,
					currency: 'CHF',
					createdAt: new Date('2024-09-01T10:00:00.000Z'),
					paymentMethod: SubscriptionPaymentMethod.stripe,
					stripeSubscriptionId: 'sub_core_high_monthly',
				},
			],
			stripeDetails: null,
		});

		const data = expectSuccess(await service.getDashboardView('contributor-1'));

		expect(loggerInstance.warn).toHaveBeenCalledWith(
			'Using subscription createdAt as schedule anchor for Stripe subscription',
			{
				subscriptionId: 'sub-stripe',
				stripeSubscriptionId: 'sub_core_high_monthly',
				reason: 'stripe_details_unavailable',
			},
		);
		expect(data.upcomingPayments).toHaveLength(UPCOMING_PAYMENTS_PER_SUBSCRIPTION);
		expect(data.upcomingPayments.map((payment) => payment.scheduledAt.toISOString())).toEqual([
			'2026-02-01T00:00:00.000Z',
			'2026-03-01T00:00:00.000Z',
			'2026-04-01T00:00:00.000Z',
			'2026-05-01T00:00:00.000Z',
		]);
	});

	it('uses stripe currentPeriodEnd instead of createdAt for upcoming payments', async () => {
		const { service, loggerInstance } = createService({
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

		expect(loggerInstance.warn).not.toHaveBeenCalled();
		expect(data.upcomingPayments.map((payment) => payment.scheduledAt.toISOString())).toEqual([
			'2026-03-05T00:00:00.000Z',
			'2026-04-05T00:00:00.000Z',
			'2026-05-05T00:00:00.000Z',
			'2026-06-05T00:00:00.000Z',
		]);
	});

	it('warns when stripe currentPeriodEnd is missing but details are available', async () => {
		const { service, loggerInstance } = createService({
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

		expectSuccess(await service.getDashboardView('contributor-1'));

		expect(loggerInstance.warn).toHaveBeenCalledWith(
			'Using subscription createdAt as schedule anchor for Stripe subscription',
			{
				subscriptionId: 'sub-stripe',
				stripeSubscriptionId: 'sub_123',
				reason: 'current_period_end_missing',
			},
		);
	});
});
