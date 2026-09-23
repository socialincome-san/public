import type { ServiceResult } from '@/lib/service-result';
import type { ContributionCountryRow, ContributionDateRange } from '@/modules/contributions/contribution.types';
import type { PayoutDateRange } from '@/modules/payouts/payout.types';
import type { LatestReserves } from '@/modules/reserves/reserve.types';
import { format } from 'date-fns';

const mockGetSucceededContributionTotal = jest.fn<Promise<ServiceResult<number>>, [dateRange?: ContributionDateRange]>();
const mockGetSucceededContributionsByContributorCountry = jest.fn<
	Promise<ServiceResult<ContributionCountryRow[]>>,
	[dateRange?: ContributionDateRange]
>();
const mockGetPaidOrConfirmedPayoutTotal = jest.fn<Promise<ServiceResult<number>>, [dateRange?: PayoutDateRange]>();
const mockGetLatestReserves = jest.fn<Promise<ServiceResult<LatestReserves>>, []>();

jest.mock('@/modules/contributions/contribution.service', () => ({
	getSucceededContributionTotal: mockGetSucceededContributionTotal,
	getSucceededContributionsByContributorCountry: mockGetSucceededContributionsByContributorCountry,
}));

jest.mock('@/modules/payouts/payout.service', () => ({
	getPaidOrConfirmedPayoutTotal: mockGetPaidOrConfirmedPayoutTotal,
}));

jest.mock('@/modules/reserves/reserve.service', () => ({
	getLatestReserves: mockGetLatestReserves,
}));

import {
	getContributionsByCountryData,
	getRunwayMonths,
	getTotalContributionsChf,
	getTransparencySummary,
} from './transparency.service';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const countryRow = (
	countryCode: ContributionCountryRow['countryCode'],
	totalChf: number,
	contributorCount = 1,
): ContributionCountryRow => ({ countryCode, totalChf, contributorCount });

beforeEach(() => {
	jest.clearAllMocks();
	mockGetSucceededContributionTotal.mockResolvedValue({ success: true, data: 0 });
	mockGetSucceededContributionsByContributorCountry.mockResolvedValue({ success: true, data: [] });
	mockGetPaidOrConfirmedPayoutTotal.mockResolvedValue({ success: true, data: 0 });
	mockGetLatestReserves.mockResolvedValue({ success: true, data: { accounts: [], total: 0 } });
});

describe('getTotalContributionsChf', () => {
	test('requests all-time contributions without a date filter', async () => {
		mockGetSucceededContributionTotal.mockResolvedValue({ success: true, data: 125 });

		expect(await getTotalContributionsChf()).toEqual({ success: true, data: 125 });
		expect(mockGetSucceededContributionTotal).toHaveBeenCalledWith(undefined);
	});

	test('maps a selected year to complete year bounds', async () => {
		await getTotalContributionsChf({ kind: 'year', year: 2025 });

		expect(mockGetSucceededContributionTotal).toHaveBeenCalledWith({
			gte: new Date('2025-01-01T00:00:00.000Z'),
			lt: new Date('2026-01-01T00:00:00.000Z'),
		});
	});

	test('returns a stable failure when the dependency throws', async () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		mockGetSucceededContributionTotal.mockRejectedValue(new Error('Database unavailable'));

		expect(await getTotalContributionsChf()).toEqual({
			success: false,
			error: 'Could not fetch total contributions',
		});
		consoleError.mockRestore();
	});
});

describe('getTransparencySummary', () => {
	test('returns inflows, outflows, and reserve data', async () => {
		const accounts = [
			{
				bankAccountId: 'account-1',
				bankAccountNumber: 'CH00',
				description: 'Operating',
				amountChf: 45,
				recordedAt: new Date('2026-08-15T12:00:00.000Z'),
			},
		];
		mockGetSucceededContributionTotal.mockResolvedValue({ success: true, data: 125 });
		mockGetPaidOrConfirmedPayoutTotal.mockResolvedValue({ success: true, data: 80 });
		mockGetLatestReserves.mockResolvedValue({ success: true, data: { accounts, total: 45 } });

		expect(await getTransparencySummary()).toEqual({
			success: true,
			data: {
				financialSummary: { inflowsChf: 125, outflowsChf: 80, reservesChf: 45 },
				reserveAccounts: accounts,
			},
		});
	});

	test('propagates reserve lookup failures', async () => {
		mockGetLatestReserves.mockResolvedValue({ success: false, error: 'Reserve lookup failed' });

		expect(await getTransparencySummary()).toEqual({ success: false, error: 'Reserve lookup failed' });
	});
});

describe('getContributionsByCountryData', () => {
	test('sorts countries, groups overflow, and allocates exactly 100 units', async () => {
		mockGetSucceededContributionsByContributorCountry.mockResolvedValue({
			success: true,
			data: [countryRow('IT', 1), countryRow('CH', 80), countryRow('US', 5), countryRow('DE', 10), countryRow('FR', 4)],
		});

		const data = expectSuccess(await getContributionsByCountryData(2));

		expect(data.totalContributionsChf).toBe(100);
		expect(data.countriesCount).toBe(5);
		expect(data.segments.map(({ countryCode }) => countryCode)).toEqual(['CH', 'DE', 'OTHER']);
		expect(data.segments.reduce((sum, segment) => sum + segment.unitCount, 0)).toBe(100);
		expect(data.otherCountries.map(({ countryCode }) => countryCode)).toEqual(['US', 'FR', 'IT']);
	});

	test('keeps every positive segment visible when units are available', async () => {
		mockGetSucceededContributionsByContributorCountry.mockResolvedValue({
			success: true,
			data: [countryRow('CH', 1_000_000), countryRow('DE', 1), countryRow('FR', 1)],
		});

		const data = expectSuccess(await getContributionsByCountryData());

		expect(data.segments.map(({ unitCount }) => unitCount)).toEqual([98, 1, 1]);
	});

	test('returns an empty model for missing contribution data', async () => {
		expect(await getContributionsByCountryData()).toEqual({
			success: true,
			data: {
				totalContributionsChf: 0,
				countriesCount: 0,
				segments: [],
				otherCountries: [],
			},
		});
	});
});

describe('reserves and runway', () => {
	test('uses the month before the latest reserve recording and floors full months', async () => {
		mockGetLatestReserves.mockResolvedValue({
			success: true,
			data: {
				accounts: [
					{
						bankAccountId: 'account-1',
						bankAccountNumber: null,
						description: null,
						amountChf: 173_780,
						recordedAt: new Date('2026-08-15T12:00:00.000Z'),
					},
				],
				total: 173_780,
			},
		});
		mockGetPaidOrConfirmedPayoutTotal.mockResolvedValue({ success: true, data: 9_905 });

		expect(await getRunwayMonths()).toEqual({ success: true, data: 17 });
		const dateRange = mockGetPaidOrConfirmedPayoutTotal.mock.calls[0]?.[0];
		expect(dateRange?.gte && format(dateRange.gte, 'yyyy-MM')).toBe('2026-07');
		expect(dateRange?.lt && format(dateRange.lt, 'yyyy-MM')).toBe('2026-08');
	});

	test('fails when the last completed month has no recipient payments', async () => {
		expect(await getRunwayMonths()).toEqual({
			success: false,
			error: 'No recipient payments in the last completed month',
		});
	});
});
