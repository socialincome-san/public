jest.mock('./campaign.repository', () => ({
	findCampaignsForCmsJoin: jest.fn(),
	findCampaignsForPublicStats: jest.fn(),
	findEditableCampaignOptions: jest.fn(),
}));
jest.mock('@/modules/exchange-rates/exchange-rate.service', () => ({
	getLatestRateForCurrency: jest.fn(),
}));
jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: jest.fn(),
}));
jest.mock('@/integrations/storyblok/storyblok-campaign.integration', () => ({
	fetchStoryblokListedCampaigns: jest.fn(),
}));
jest.mock('@/integrations/storyblok/storyblok-management.integration', () => ({
	listCampaignDefaultImages: jest.fn(),
}));
jest.mock('@/lib/utils/now', () => ({
	now: () => new Date('2025-06-15T12:00:00.000Z'),
	nowMs: () => new Date('2025-06-15T12:00:00.000Z').getTime(),
}));

import { ProgramPermission, type Currency } from '@/generated/prisma/enums';
import { resultOk, type ServiceResult } from '@/lib/service-result';
import { getLatestRateForCurrency } from '@/modules/exchange-rates/exchange-rate.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import * as campaignRepository from './campaign.repository';
import {
	getCampaignsForCmsJoin,
	getEditableCampaignOptions,
	getPublicCampaignStatsByIds,
	getPublicCampaignsWithStats,
} from './campaign.service';

const mockFindCampaignsForCmsJoin = campaignRepository.findCampaignsForCmsJoin as jest.Mock;
const mockFindCampaignsForPublicStats = campaignRepository.findCampaignsForPublicStats as jest.Mock;
const mockFindEditableCampaignOptions = campaignRepository.findEditableCampaignOptions as jest.Mock;
const mockGetLatestRateForCurrency = getLatestRateForCurrency as jest.Mock;
const mockGetAccessiblePrograms = getAccessiblePrograms as jest.Mock;

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const setExchangeRates = (exchangeRates: Partial<Record<Currency, number>> = { CHF: 1, EUR: 1 }) => {
	mockGetLatestRateForCurrency.mockImplementation((currency: Currency) => {
		const rate = exchangeRates[currency];

		return Promise.resolve(
			rate === undefined
				? { success: false as const, error: 'No exchange rate found' }
				: { success: true as const, data: { currency, rate } },
		);
	});
};

describe('campaign public preview data', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		setExchangeRates();
	});

	test('getCampaignsForCmsJoin returns creator and currency with trimmed slug for active campaigns', async () => {
		mockFindCampaignsForCmsJoin.mockResolvedValue([
			{
				id: 'campaign-1',
				slug: ' holiday-fundraiser ',
				currency: 'CHF',
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 10_000,
				additionalAmountChf: 0,
				contributions: [{ amountChf: 100 }],
			},
			{
				id: 'campaign-2',
				slug: '   ',
				currency: 'EUR',
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: null,
				additionalAmountChf: null,
				contributions: [],
			},
		]);

		const campaigns = expectSuccess(await getCampaignsForCmsJoin());

		expect(campaigns).toEqual([
			{
				id: 'campaign-1',
				slug: 'holiday-fundraiser',
				currency: 'CHF',
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 10_000,
				isActive: true,
			},
		]);
	});

	test('getCampaignsForCmsJoin with activity all includes inactive campaigns', async () => {
		mockFindCampaignsForCmsJoin.mockResolvedValue([
			{
				id: 'campaign-1',
				slug: 'active-campaign',
				currency: 'CHF',
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 10_000,
				additionalAmountChf: 0,
				contributions: [{ amountChf: 100 }],
			},
			{
				id: 'campaign-2',
				slug: 'inactive-campaign',
				currency: 'EUR',
				endDate: new Date('2025-05-01T12:00:00.000Z'),
				goal: 10_000,
				additionalAmountChf: 0,
				contributions: [{ amountChf: 100 }],
			},
		]);

		const campaigns = expectSuccess(await getCampaignsForCmsJoin({ activity: 'all' }));

		expect(campaigns).toEqual([
			{
				id: 'campaign-1',
				slug: 'active-campaign',
				currency: 'CHF',
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 10_000,
				isActive: true,
			},
			{
				id: 'campaign-2',
				slug: 'inactive-campaign',
				currency: 'EUR',
				endDate: new Date('2025-05-01T12:00:00.000Z'),
				goal: 10_000,
				isActive: false,
			},
		]);
	});

	test('getCampaignsForCmsJoin with activity inactive filters to ended or fully funded campaigns', async () => {
		mockFindCampaignsForCmsJoin.mockResolvedValue([
			{
				id: 'campaign-ended',
				slug: 'ended-campaign',
				currency: 'EUR',
				endDate: new Date('2025-05-01T12:00:00.000Z'),
				goal: 10_000,
				additionalAmountChf: 0,
				contributions: [{ amountChf: 100 }],
			},
			{
				id: 'campaign-funded',
				slug: 'funded-campaign',
				currency: 'CHF',
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 500,
				additionalAmountChf: 0,
				contributions: [{ amountChf: 500 }],
			},
			{
				id: 'campaign-active',
				slug: 'active-campaign',
				currency: 'CHF',
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 10_000,
				additionalAmountChf: 0,
				contributions: [{ amountChf: 100 }],
			},
		]);

		const campaigns = expectSuccess(await getCampaignsForCmsJoin({ activity: 'inactive' }));

		expect(campaigns).toEqual([
			{
				id: 'campaign-ended',
				slug: 'ended-campaign',
				currency: 'EUR',
				endDate: new Date('2025-05-01T12:00:00.000Z'),
				goal: 10_000,
				isActive: false,
			},
			{
				id: 'campaign-funded',
				slug: 'funded-campaign',
				currency: 'CHF',
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 500,
				isActive: false,
			},
		]);
	});

	test('getPublicCampaignStatsByIds computes collected amount and percentage', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		mockFindCampaignsForPublicStats.mockResolvedValue([
			{
				id: 'campaign-1',
				endDate,
				goal: 10_000,
				currency: 'CHF',
				additionalAmountChf: 500,
				contributions: [{ amountChf: 2_000 }, { amountChf: 5_733 }],
			},
		]);

		const statsById = expectSuccess(await getPublicCampaignStatsByIds(['campaign-1']));

		expect(statsById).toEqual({
			'campaign-1': {
				contributionsCount: 2,
				daysLeft: 30,
				amountCollected: 8_233,
				percentageCollected: 82,
			},
		});
	});

	test('getPublicCampaignStatsByIds converts collected amounts using the campaign currency exchange rate', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		setExchangeRates({ EUR: 0.8 });
		mockFindCampaignsForPublicStats.mockResolvedValue([
			{
				id: 'campaign-1',
				endDate,
				goal: 4_000,
				currency: 'EUR',
				additionalAmountChf: 500,
				contributions: [{ amountChf: 2_000 }],
			},
		]);

		const statsById = expectSuccess(await getPublicCampaignStatsByIds(['campaign-1']));

		expect(mockGetLatestRateForCurrency).toHaveBeenCalledWith('EUR');
		expect(statsById['campaign-1']).toEqual({
			contributionsCount: 1,
			daysLeft: 30,
			amountCollected: 2_000,
			percentageCollected: 50,
		});
	});

	test('getPublicCampaignStatsByIds reuses an exchange rate for campaigns with the same currency', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		setExchangeRates({ EUR: 0.8 });
		mockFindCampaignsForPublicStats.mockResolvedValue([
			{
				id: 'campaign-1',
				endDate,
				goal: null,
				currency: 'EUR',
				additionalAmountChf: null,
				contributions: [],
			},
			{
				id: 'campaign-2',
				endDate,
				goal: null,
				currency: 'EUR',
				additionalAmountChf: null,
				contributions: [],
			},
		]);

		expectSuccess(await getPublicCampaignStatsByIds(['campaign-1', 'campaign-2']));

		expect(mockGetLatestRateForCurrency).toHaveBeenCalledTimes(1);
		expect(mockGetLatestRateForCurrency).toHaveBeenCalledWith('EUR');
	});

	test('getPublicCampaignStatsByIds omits monetary stats when a non-CHF exchange rate is unavailable', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		setExchangeRates({});
		mockFindCampaignsForPublicStats.mockResolvedValue([
			{
				id: 'campaign-1',
				endDate,
				goal: 2_000,
				currency: 'EUR',
				additionalAmountChf: null,
				contributions: [{ amountChf: 1_000 }],
			},
		]);

		const statsById = expectSuccess(await getPublicCampaignStatsByIds(['campaign-1']));

		expect(mockGetLatestRateForCurrency).toHaveBeenCalledWith('EUR');
		expect(statsById['campaign-1']).toEqual({
			contributionsCount: 1,
			daysLeft: 30,
			amountCollected: null,
			percentageCollected: null,
		});
	});

	test('getPublicCampaignStatsByIds uses rate one for CHF without an exchange-rate lookup', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		setExchangeRates({});
		mockFindCampaignsForPublicStats.mockResolvedValue([
			{
				id: 'campaign-1',
				endDate,
				goal: 2_000,
				currency: 'CHF',
				additionalAmountChf: null,
				contributions: [{ amountChf: 1_000 }],
			},
		]);

		const statsById = expectSuccess(await getPublicCampaignStatsByIds(['campaign-1']));

		expect(mockGetLatestRateForCurrency).not.toHaveBeenCalled();
		expect(statsById['campaign-1']).toEqual({
			contributionsCount: 1,
			daysLeft: 30,
			amountCollected: 1_000,
			percentageCollected: 50,
		});
	});

	test('getPublicCampaignStatsByIds omits monetary stats when a non-CHF exchange rate is invalid', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		setExchangeRates({ EUR: 0 });
		mockFindCampaignsForPublicStats.mockResolvedValue([
			{
				id: 'campaign-1',
				endDate,
				goal: 2_000,
				currency: 'EUR',
				additionalAmountChf: null,
				contributions: [{ amountChf: 1_000 }],
			},
		]);

		const statsById = expectSuccess(await getPublicCampaignStatsByIds(['campaign-1']));

		expect(statsById['campaign-1']).toMatchObject({
			amountCollected: null,
			percentageCollected: null,
		});
	});

	test('getPublicCampaignStatsByIds omits percentage when campaign has no goal', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		mockFindCampaignsForPublicStats.mockResolvedValue([
			{
				id: 'campaign-1',
				endDate,
				goal: null,
				currency: 'CHF',
				additionalAmountChf: null,
				contributions: [{ amountChf: 1_000 }],
			},
		]);

		const statsById = expectSuccess(await getPublicCampaignStatsByIds(['campaign-1']));

		expect(statsById['campaign-1']).toEqual({
			contributionsCount: 1,
			daysLeft: 30,
			amountCollected: 1_000,
			percentageCollected: null,
		});
	});

	test('getPublicCampaignStatsByIds clamps expired campaigns to zero days left', async () => {
		const endDate = new Date('2025-06-01T12:00:00.000Z');
		mockFindCampaignsForPublicStats.mockResolvedValue([
			{
				id: 'campaign-1',
				endDate,
				goal: 1_000,
				currency: 'CHF',
				additionalAmountChf: null,
				contributions: [],
			},
		]);

		const statsById = expectSuccess(await getPublicCampaignStatsByIds(['campaign-1']));

		expect(statsById['campaign-1']?.daysLeft).toBe(0);
	});

	test('getPublicCampaignsWithStats returns empty stats map when stats query fails', async () => {
		mockFindCampaignsForPublicStats.mockRejectedValueOnce(new Error('stats unavailable'));

		const allResult = expectSuccess(
			await getPublicCampaignsWithStats([
				{
					id: 'campaign-1',
					slug: 'holiday-fundraiser',
					currency: 'CHF',
					endDate: new Date('2025-07-15T12:00:00.000Z'),
					goal: 10_000,
					isActive: true,
				},
			]),
		);

		expect(allResult.statsById).toEqual({});
		expect(allResult.campaigns).toHaveLength(1);
	});

	test('getPublicCampaignStatsByIds returns an empty map for blank ids', async () => {
		await expect(getPublicCampaignStatsByIds(['', '  '])).resolves.toEqual(resultOk({}));
		expect(mockFindCampaignsForPublicStats).not.toHaveBeenCalled();
	});
});

describe('getEditableCampaignOptions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns slug options for operator-accessible programs', async () => {
		mockGetAccessiblePrograms.mockResolvedValue(
			resultOk([
				{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.operator },
				{ programId: 'program-2', programName: 'Other', permission: ProgramPermission.owner },
			]),
		);
		mockFindEditableCampaignOptions.mockResolvedValue([
			{ id: 'campaign-1', slug: 'holiday-fundraiser' },
			{ id: 'campaign-2', slug: null },
		]);

		await expect(getEditableCampaignOptions('user-1')).resolves.toEqual(
			resultOk([{ id: 'campaign-1', name: 'holiday-fundraiser' }]),
		);
		expect(mockFindEditableCampaignOptions).toHaveBeenCalledWith(['program-1']);
	});

	test('returns an empty list when the user cannot list campaigns', async () => {
		mockGetAccessiblePrograms.mockResolvedValue(
			resultOk([{ programId: 'program-1', programName: 'Program', permission: ProgramPermission.owner }]),
		);

		await expect(getEditableCampaignOptions('user-1')).resolves.toEqual(resultOk([]));
		expect(mockFindEditableCampaignOptions).not.toHaveBeenCalled();
	});
});
