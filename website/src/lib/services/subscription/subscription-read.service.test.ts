import { PrismaClient, SubscriptionPaymentMethod } from '@/generated/prisma/client';
import type { ContributionReadService } from '../contribution/contribution-read.service';
import type { ServiceResult } from '../core/base.types';
import type { ProgramAccessReadService } from '../program-access/program-access-read.service';
import type { StripeService } from '../stripe/stripe.service';
import { UPCOMING_PAYMENTS_PER_SUBSCRIPTION } from './subscription-payment-schedule';
import { SubscriptionReadService } from './subscription-read.service';
import type { SubscriptionTableQuery } from './subscription.types';

jest.mock('@/generated/prisma/client', () => ({
	PrismaClient: class {},
	ProgramPermission: { operator: 'operator', owner: 'owner' },
	SubscriptionPaymentMethod: {
		stripe: 'stripe',
		bank_transfer: 'bank_transfer',
	},
	SubscriptionStatus: {
		active: 'active',
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
}: {
	subscriptions?: {
		id: string;
		amount: unknown;
		currency: 'CHF' | 'EUR' | 'USD';
		createdAt: Date;
		coverTransactionCosts?: boolean;
		paymentMethod: 'stripe' | 'bank_transfer';
		stripeSubscriptionId: string | null;
		bankStandingOrderReference?: string | null;
		contributor?: { paymentReferenceId: string | null };
	}[];
	stripeDetails?: { brand?: string; last4?: string; currentPeriodEnd: Date | null } | null;
} = {}) => {
	const db = {
		subscription: {
			findMany: jest.fn().mockResolvedValue(
				subscriptions.map((subscription) => ({
					bankStandingOrderReference: null,
					coverTransactionCosts: false,
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
	const programAccessService = {
		getAccessiblePrograms: jest.fn(),
	} as unknown as ProgramAccessReadService;

	return {
		service: new SubscriptionReadService(db, programAccessService, contributionReadService, {
			getSubscriptionStripeDetails: jest.fn().mockResolvedValue(stripeDetails),
		} as unknown as StripeService),
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
		const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
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
		expect(consoleWarn).toHaveBeenCalledWith('Skipping upcoming payments for Stripe subscription', {
			subscriptionId: 'sub-stripe',
			stripeSubscriptionId: 'sub_123',
			reason: 'stripe_details_unavailable',
		});
		expect(expectSuccess(await missingPeriodEnd.service.getDashboardView('contributor-1')).upcomingPayments).toEqual([]);
		expect(consoleWarn).toHaveBeenCalledWith('Skipping upcoming payments for Stripe subscription', {
			subscriptionId: 'sub-stripe',
			stripeSubscriptionId: 'sub_123',
			reason: 'current_period_end_missing',
		});
		consoleWarn.mockRestore();
	});
});

const defaultTableQuery: SubscriptionTableQuery = { page: 1, pageSize: 10, search: '' };

const createPortalService = ({
	accessiblePrograms = [{ programId: 'program-1', programName: 'Core', permission: 'operator' as const }],
	accessError,
	subscriptions = [],
	totalCount,
}: {
	accessiblePrograms?: { programId: string; programName: string; permission: 'operator' | 'owner' }[];
	accessError?: string;
	subscriptions?: {
		id: string;
		createdAt: Date;
		amount: unknown;
		currency: 'CHF' | 'EUR' | 'USD';
		status: 'active' | 'ended';
		cancellationReason: 'financial_situation_changed' | 'prefer_one_time' | null;
		paymentMethod: 'stripe' | 'bank_transfer';
		stripeSubscriptionId: string | null;
		bankStandingOrderReference: string | null;
		contributor: { contact: { firstName: string; lastName: string; email: string } };
	}[];
	totalCount?: number;
} = {}) => {
	const subscriptionFindMany = jest.fn().mockResolvedValue(subscriptions);
	const subscriptionCount = jest.fn().mockResolvedValue(totalCount ?? subscriptions.length);
	const db = {
		subscription: { findMany: subscriptionFindMany, count: subscriptionCount },
	} as unknown as PrismaClient;
	const programAccessService = {
		getAccessiblePrograms: jest
			.fn()
			.mockResolvedValue(
				accessError ? { success: false as const, error: accessError } : { success: true as const, data: accessiblePrograms },
			),
	} as unknown as ProgramAccessReadService;

	return {
		service: new SubscriptionReadService(
			db,
			programAccessService,
			{ getContributorContributionSummary: jest.fn() } as unknown as ContributionReadService,
			{ getSubscriptionStripeDetails: jest.fn() } as unknown as StripeService,
		),
		subscriptionFindMany,
	};
};

const stripeTableSubscription = {
	id: 'sub-stripe',
	createdAt: new Date('2024-09-01T10:00:00.000Z'),
	amount: 1200,
	currency: 'CHF' as const,
	status: 'active' as const,
	cancellationReason: null,
	paymentMethod: 'stripe' as const,
	stripeSubscriptionId: 'sub_core_high_monthly',
	bankStandingOrderReference: null,
	contributor: { contact: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' } },
};

const subscriptionTableSelect = {
	id: true,
	createdAt: true,
	amount: true,
	currency: true,
	status: true,
	cancellationReason: true,
	paymentMethod: true,
	stripeSubscriptionId: true,
	bankStandingOrderReference: true,
	contributor: {
		select: {
			contact: {
				select: {
					firstName: true,
					lastName: true,
					email: true,
				},
			},
		},
	},
};

describe('SubscriptionReadService.getPaginatedTableView', () => {
	it('returns empty rows when the user has no operator program access', async () => {
		const { service, subscriptionFindMany } = createPortalService({
			accessiblePrograms: [{ programId: 'program-owner', programName: 'Owner only', permission: 'owner' }],
		});

		expect(expectSuccess(await service.getPaginatedTableView('user-1', defaultTableQuery))).toEqual({
			tableRows: [],
			totalCount: 0,
		});
		expect(subscriptionFindMany).not.toHaveBeenCalled();
	});

	it('propagates program access failures', async () => {
		const { service } = createPortalService({ accessError: 'User has no active organization' });
		const result = await service.getPaginatedTableView('user-1', defaultTableQuery);

		expect(result.success).toBe(false);
		if (result.success) {
			throw new Error('Expected failure');
		}
		expect(result.error).toBe('User has no active organization');
	});

	it('scopes subscriptions to operator programs only', async () => {
		const { service, subscriptionFindMany } = createPortalService({
			accessiblePrograms: [
				{ programId: 'program-1', programName: 'Core', permission: 'operator' },
				{ programId: 'program-owner', programName: 'Owner only', permission: 'owner' },
			],
			subscriptions: [stripeTableSubscription],
		});

		await service.getPaginatedTableView('user-1', defaultTableQuery);

		expect(subscriptionFindMany).toHaveBeenCalledWith({
			where: { campaign: { programId: { in: ['program-1'] } } },
			select: subscriptionTableSelect,
			orderBy: [{ createdAt: 'desc' }],
			skip: 0,
			take: 10,
		});
	});

	it('applies status, payment method, and search filters', async () => {
		const { service, subscriptionFindMany } = createPortalService({ subscriptions: [stripeTableSubscription] });

		await service.getPaginatedTableView('user-1', {
			...defaultTableQuery,
			subscriptionStatus: 'ended',
			subscriptionPaymentMethod: 'bank_transfer',
			search: 'ada@example.com',
		});

		expect(subscriptionFindMany).toHaveBeenCalledWith({
			where: {
				campaign: { programId: { in: ['program-1'] } },
				status: 'ended',
				paymentMethod: 'bank_transfer',
				OR: [
					{ id: { contains: 'ada@example.com', mode: 'insensitive' } },
					{ contributor: { contact: { firstName: { contains: 'ada@example.com', mode: 'insensitive' } } } },
					{ contributor: { contact: { lastName: { contains: 'ada@example.com', mode: 'insensitive' } } } },
					{ contributor: { contact: { email: { contains: 'ada@example.com', mode: 'insensitive' } } } },
					{ stripeSubscriptionId: { contains: 'ada@example.com', mode: 'insensitive' } },
					{ bankStandingOrderReference: { contains: 'ada@example.com', mode: 'insensitive' } },
				],
			},
			select: subscriptionTableSelect,
			orderBy: [{ createdAt: 'desc' }],
			skip: 0,
			take: 10,
		});
	});

	it('maps table rows and paginates', async () => {
		const bankSubscription = {
			id: 'sub-bank',
			createdAt: new Date('2024-10-15T10:00:00.000Z'),
			amount: 80,
			currency: 'CHF' as const,
			status: 'ended' as const,
			cancellationReason: 'prefer_one_time' as const,
			paymentMethod: 'bank_transfer' as const,
			stripeSubscriptionId: null,
			bankStandingOrderReference: '1731700000',
			contributor: { contact: { firstName: 'Grace', lastName: 'Hopper', email: 'grace@example.com' } },
		};
		const { service, subscriptionFindMany } = createPortalService({
			subscriptions: [bankSubscription],
			totalCount: 21,
		});

		const data = expectSuccess(
			await service.getPaginatedTableView('user-1', {
				page: 3,
				pageSize: 10,
				search: '',
				sortBy: 'amount',
				sortDirection: 'asc',
			}),
		);

		expect(subscriptionFindMany).toHaveBeenCalledWith({
			where: { campaign: { programId: { in: ['program-1'] } } },
			select: subscriptionTableSelect,
			orderBy: [{ amount: 'asc' }],
			skip: 20,
			take: 10,
		});
		expect(data.totalCount).toBe(21);
		expect(data.tableRows).toEqual([
			{
				id: 'sub-bank',
				firstName: 'Grace',
				lastName: 'Hopper',
				email: 'grace@example.com',
				amount: 80,
				currency: 'CHF',
				status: 'ended',
				cancellationReason: 'prefer_one_time',
				paymentMethod: 'bank_transfer',
				stripeSubscriptionId: null,
				bankStandingOrderReference: '1731700000',
				createdAt: bankSubscription.createdAt,
			},
		]);
	});
});
