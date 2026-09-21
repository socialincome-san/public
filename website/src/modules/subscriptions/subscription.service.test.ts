import { ProgramPermission, SubscriptionPaymentMethod, SubscriptionStatus } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';
import { getContributorContributionSummary } from '@/modules/contributions/contribution.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import { getSubscriptionStripeDetails } from '@/modules/stripe-payments/stripe-payment.service';
import * as subscriptionRepository from './subscription.repository';
import {
	cancelBankTransfer,
	getDashboardView,
	getPaginatedTableView,
	updateBankTransferAmount,
} from './subscription.service';
import type { SubscriptionTableQuery } from './subscription.types';
import { UPCOMING_PAYMENTS_PER_SUBSCRIPTION } from './subscription.types';

jest.mock('./subscription.repository', () => ({
	findActiveSubscriptionsByContributorId: jest.fn(),
	findSubscriptionTableSource: jest.fn(),
	findOwnedSubscriptionPaymentMethod: jest.fn(),
	findOwnedActiveBankTransferSubscription: jest.fn(),
	findOwnedBankTransferSubscription: jest.fn(),
	updateBankStandingOrder: jest.fn(),
	updateBankTransferSubscriptionAmount: jest.fn(),
	updateBankTransferSubscriptionCancellation: jest.fn(),
}));

jest.mock('@/modules/contributions/contribution.service', () => ({
	getContributorContributionSummary: jest.fn(),
}));

jest.mock('@/modules/stripe-payments/stripe-payment.service', () => ({
	getSubscriptionStripeDetails: jest.fn(),
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: jest.fn(),
}));

jest.mock('@/lib/utils/now', () => ({
	now: jest.fn(() => new Date('2026-01-15T12:00:00.000Z')),
}));

const mockFindActiveSubscriptionsByContributorId = jest.mocked(
	subscriptionRepository.findActiveSubscriptionsByContributorId,
);
const mockFindSubscriptionTableSource = jest.mocked(subscriptionRepository.findSubscriptionTableSource);
const mockFindOwnedActiveBankTransferSubscription = jest.mocked(
	subscriptionRepository.findOwnedActiveBankTransferSubscription,
);
const mockFindOwnedBankTransferSubscription = jest.mocked(subscriptionRepository.findOwnedBankTransferSubscription);
const mockUpdateBankTransferSubscriptionAmount = jest.mocked(subscriptionRepository.updateBankTransferSubscriptionAmount);
const mockUpdateBankTransferSubscriptionCancellation = jest.mocked(
	subscriptionRepository.updateBankTransferSubscriptionCancellation,
);

const mockGetContributorContributionSummary = getContributorContributionSummary as jest.MockedFunction<
	typeof getContributorContributionSummary
>;
const mockGetSubscriptionStripeDetails = getSubscriptionStripeDetails as jest.MockedFunction<
	typeof getSubscriptionStripeDetails
>;
const mockGetAccessiblePrograms = getAccessiblePrograms as jest.MockedFunction<typeof getAccessiblePrograms>;

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const setupDashboard = ({
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
	mockFindActiveSubscriptionsByContributorId.mockResolvedValue(
		subscriptions.map((subscription) => ({
			bankStandingOrderReference: null,
			coverTransactionCosts: false,
			contributor: { paymentReferenceId: null },
			...subscription,
		})) as never,
	);
	mockGetContributorContributionSummary.mockResolvedValue({
		success: true,
		data: { totalAmountChf: 750, count: 15, firstContributionAt: new Date('2024-11-03T00:00:00.000Z') },
	});
	mockGetSubscriptionStripeDetails.mockResolvedValue({ success: true, data: stripeDetails });
};

describe('getDashboardView', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('omits qr bill when bank transfer references are incomplete or currency is unsupported', async () => {
		setupDashboard({
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
		expect(expectSuccess(await getDashboardView('contributor-1')).activeSubscriptions[0]?.paymentDisplay).toEqual({
			type: 'bank_transfer',
			qrBill: null,
		});

		setupDashboard({
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
		expect(expectSuccess(await getDashboardView('contributor-1')).activeSubscriptions[0]?.paymentDisplay).toEqual({
			type: 'bank_transfer',
			qrBill: null,
		});
	});

	it('returns null monthly total for mixed currencies', async () => {
		setupDashboard({
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

		expect(expectSuccess(await getDashboardView('contributor-1')).monthlyContribution).toEqual({
			totalAmount: null,
			currency: null,
			activeCount: 2,
		});
	});

	it('schedules stripe upcoming payments from currentPeriodEnd', async () => {
		setupDashboard({
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

		const data = expectSuccess(await getDashboardView('contributor-1'));

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
		setupDashboard({
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

		expect(expectSuccess(await getDashboardView('contributor-1')).upcomingPayments).toEqual([]);
		expect(consoleWarn).toHaveBeenCalledWith('Skipping upcoming payments for Stripe subscription', {
			subscriptionId: 'sub-stripe',
			stripeSubscriptionId: 'sub_123',
			reason: 'stripe_details_unavailable',
		});

		setupDashboard({
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

		expect(expectSuccess(await getDashboardView('contributor-1')).upcomingPayments).toEqual([]);
		expect(consoleWarn).toHaveBeenCalledWith('Skipping upcoming payments for Stripe subscription', {
			subscriptionId: 'sub-stripe',
			stripeSubscriptionId: 'sub_123',
			reason: 'current_period_end_missing',
		});
		consoleWarn.mockRestore();
	});
});

const defaultTableQuery: SubscriptionTableQuery = { page: 1, pageSize: 10, search: '' };

const setupPortal = ({
	accessiblePrograms = [{ programId: 'program-1', programName: 'Core', permission: ProgramPermission.operator }],
	accessError,
	subscriptions = [],
	totalCount,
}: {
	accessiblePrograms?: { programId: string; programName: string; permission: ProgramPermission }[];
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
	mockFindSubscriptionTableSource.mockResolvedValue({
		subscriptions: subscriptions as never,
		totalCount: totalCount ?? subscriptions.length,
	});
	mockGetAccessiblePrograms.mockResolvedValue(
		accessError ? { success: false, error: accessError } : { success: true, data: accessiblePrograms },
	);
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

describe('getPaginatedTableView', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns empty rows when the user has no operator program access', async () => {
		setupPortal({
			accessiblePrograms: [{ programId: 'program-owner', programName: 'Owner only', permission: ProgramPermission.owner }],
		});

		expect(expectSuccess(await getPaginatedTableView('user-1', defaultTableQuery))).toEqual({
			tableRows: [],
			totalCount: 0,
		});
		expect(mockFindSubscriptionTableSource).not.toHaveBeenCalled();
	});

	it('propagates program access failures', async () => {
		setupPortal({ accessError: 'User has no active organization' });
		const result = await getPaginatedTableView('user-1', defaultTableQuery);

		expect(result.success).toBe(false);
		if (result.success) {
			throw new Error('Expected failure');
		}
		expect(result.error).toBe('User has no active organization');
	});

	it('scopes subscriptions to operator programs only', async () => {
		setupPortal({
			accessiblePrograms: [
				{ programId: 'program-1', programName: 'Core', permission: ProgramPermission.operator },
				{ programId: 'program-owner', programName: 'Owner only', permission: ProgramPermission.owner },
			],
			subscriptions: [stripeTableSubscription],
		});

		await getPaginatedTableView('user-1', defaultTableQuery);

		expect(mockFindSubscriptionTableSource).toHaveBeenCalledWith({
			accessibleProgramIds: ['program-1'],
			query: defaultTableQuery,
		});
	});

	it('applies status, payment method, and search filters', async () => {
		setupPortal({ subscriptions: [stripeTableSubscription] });

		await getPaginatedTableView('user-1', {
			...defaultTableQuery,
			subscriptionStatus: 'ended',
			subscriptionPaymentMethod: 'bank_transfer',
			search: 'ada@example.com',
		});

		expect(mockFindSubscriptionTableSource).toHaveBeenCalledWith({
			accessibleProgramIds: ['program-1'],
			query: {
				...defaultTableQuery,
				subscriptionStatus: 'ended',
				subscriptionPaymentMethod: 'bank_transfer',
				search: 'ada@example.com',
			},
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
		setupPortal({
			subscriptions: [bankSubscription],
			totalCount: 21,
		});

		const data = expectSuccess(
			await getPaginatedTableView('user-1', {
				page: 3,
				pageSize: 10,
				search: '',
				sortBy: 'amount',
				sortDirection: 'asc',
			}),
		);

		expect(mockFindSubscriptionTableSource).toHaveBeenCalledWith({
			accessibleProgramIds: ['program-1'],
			query: {
				page: 3,
				pageSize: 10,
				search: '',
				sortBy: 'amount',
				sortDirection: 'asc',
			},
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

describe('bank transfer mutations', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('rejects invalid amounts and missing or ended subscriptions', async () => {
		const invalidAmount = await updateBankTransferAmount({
			contributorId: 'contributor-1',
			subscriptionId: 'sub-bank',
			amount: 0,
		});
		expect(invalidAmount.success).toBe(false);
		expect(mockFindOwnedActiveBankTransferSubscription).not.toHaveBeenCalled();

		mockFindOwnedActiveBankTransferSubscription.mockResolvedValueOnce(null);
		const missing = await updateBankTransferAmount({
			contributorId: 'contributor-1',
			subscriptionId: 'sub-bank',
			amount: 50,
		});
		expect(missing).toEqual({ success: false, error: 'Subscription not found' });
		expect(mockUpdateBankTransferSubscriptionAmount).not.toHaveBeenCalled();

		mockFindOwnedBankTransferSubscription.mockResolvedValueOnce({ id: 'sub-bank', status: SubscriptionStatus.ended });
		const ended = await cancelBankTransfer({
			contributorId: 'contributor-1',
			subscriptionId: 'sub-bank',
			reason: 'other',
		});
		expect(ended).toEqual({ success: false, error: 'Subscription not found' });
		expect(mockUpdateBankTransferSubscriptionCancellation).not.toHaveBeenCalled();
	});
});
