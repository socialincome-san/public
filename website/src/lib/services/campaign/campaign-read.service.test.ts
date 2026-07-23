import { type Currency, type PrismaClient } from '@/generated/prisma/client';
import type { ServiceResult } from '../core/base.types';
import type { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import type { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { CampaignReadService } from './campaign-read.service';

jest.mock('@/generated/prisma/client', () => ({
	Currency: { CHF: 'CHF', EUR: 'EUR' },
	ContributionStatus: { succeeded: 'succeeded' },
	Prisma: {},
	PrismaClient: class {},
	ProgramPermission: { operator: 'operator', owner: 'owner' },
}));
jest.mock('@/lib/utils/now', () => ({
	now: () => new Date('2025-06-15T12:00:00.000Z'),
	nowMs: () => new Date('2025-06-15T12:00:00.000Z').getTime(),
}));

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const createService = ({
	campaigns = [],
	statsCampaigns = [],
	exchangeRates = { CHF: 1, EUR: 1 },
}: {
	campaigns?: {
		id: string;
		title: string;
		slug: string | null;
		creatorName: string | null;
		currency: 'CHF' | 'EUR';
		featured: boolean;
		createdAt: Date;
		isActive: boolean;
	}[];
	statsCampaigns?: {
		id: string;
		endDate: Date;
		goal: number | null;
		currency: 'CHF' | 'EUR';
		additionalAmountChf: number | null;
		contributions: { amountChf: number }[];
	}[];
	exchangeRates?: Partial<Record<Currency, number>>;
} = {}) => {
	const campaignFindMany = jest.fn().mockResolvedValue(campaigns);
	const db = {
		campaign: {
			findMany: campaignFindMany,
		},
	};

	const exchangeRateService = {
		getLatestRateForCurrency: jest.fn(async (currency: Currency) => {
			const rate = exchangeRates[currency];
			return rate === undefined
				? { success: false as const, error: 'No exchange rate found' }
				: { success: true as const, data: { currency, rate } };
		}),
	};

	const programAccessService = {} satisfies Partial<ProgramAccessReadService>;
	const service = new CampaignReadService(
		db as unknown as PrismaClient,
		programAccessService as ProgramAccessReadService,
		exchangeRateService as unknown as ExchangeRateReadService,
	);

	return { service, campaignFindMany, exchangeRateService, statsCampaigns };
};

describe('CampaignReadService public campaign preview data', () => {
	test('getPublicCampaigns returns creator and currency with trimmed slug', async () => {
		const { service, campaignFindMany } = createService({
			campaigns: [
				{
					id: 'campaign-1',
					title: 'Holiday Fundraiser',
					slug: ' holiday-fundraiser ',
					creatorName: 'smartive AG',
					currency: 'CHF',
					featured: true,
					createdAt: new Date('2025-01-01T00:00:00.000Z'),
					isActive: true,
				},
				{
					id: 'campaign-2',
					title: 'Hidden Campaign',
					slug: '   ',
					creatorName: null,
					currency: 'EUR',
					featured: false,
					createdAt: new Date('2025-01-02T00:00:00.000Z'),
					isActive: true,
				},
			],
		});

		const campaigns = expectSuccess(await service.getPublicCampaigns());

		expect(campaignFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ isActive: true }),
			}),
		);
		expect(campaigns).toEqual([
			{
				id: 'campaign-1',
				title: 'Holiday Fundraiser',
				slug: 'holiday-fundraiser',
				creatorName: 'smartive AG',
				currency: 'CHF',
				isActive: true,
			},
		]);
	});

	test('getPublicCampaigns with activity all includes inactive campaigns', async () => {
		const { service, campaignFindMany } = createService({
			campaigns: [
				{
					id: 'campaign-1',
					title: 'Active Campaign',
					slug: 'active-campaign',
					creatorName: 'smartive AG',
					currency: 'CHF',
					featured: true,
					createdAt: new Date('2025-01-01T00:00:00.000Z'),
					isActive: true,
				},
				{
					id: 'campaign-2',
					title: 'Inactive Campaign',
					slug: 'inactive-campaign',
					creatorName: null,
					currency: 'EUR',
					featured: false,
					createdAt: new Date('2025-01-02T00:00:00.000Z'),
					isActive: false,
				},
			],
		});

		const campaigns = expectSuccess(await service.getPublicCampaigns({ activity: 'all' }));

		expect(campaignFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.not.objectContaining({ isActive: expect.anything() }),
			}),
		);
		expect(campaigns).toEqual([
			{
				id: 'campaign-1',
				title: 'Active Campaign',
				slug: 'active-campaign',
				creatorName: 'smartive AG',
				currency: 'CHF',
				isActive: true,
			},
			{
				id: 'campaign-2',
				title: 'Inactive Campaign',
				slug: 'inactive-campaign',
				creatorName: null,
				currency: 'EUR',
				isActive: false,
			},
		]);
	});

	test('getPublicCampaigns with activity inactive filters to inactive campaigns', async () => {
		const { service, campaignFindMany } = createService({
			campaigns: [
				{
					id: 'campaign-2',
					title: 'Inactive Campaign',
					slug: 'inactive-campaign',
					creatorName: null,
					currency: 'EUR',
					featured: false,
					createdAt: new Date('2025-01-02T00:00:00.000Z'),
					isActive: false,
				},
			],
		});

		const campaigns = expectSuccess(await service.getPublicCampaigns({ activity: 'inactive' }));

		expect(campaignFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ isActive: false }),
			}),
		);
		expect(campaigns).toEqual([
			{
				id: 'campaign-2',
				title: 'Inactive Campaign',
				slug: 'inactive-campaign',
				creatorName: null,
				currency: 'EUR',
				isActive: false,
			},
		]);
	});

	test('getPublicCampaignStatsByIds computes collected amount and percentage', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		const { service, campaignFindMany } = createService({
			statsCampaigns: [
				{
					id: 'campaign-1',
					endDate,
					goal: 10_000,
					currency: 'CHF',
					additionalAmountChf: 500,
					contributions: [{ amountChf: 2_000 }, { amountChf: 5_733 }],
				},
			],
		});

		campaignFindMany.mockResolvedValueOnce([
			{
				id: 'campaign-1',
				endDate,
				goal: 10_000,
				currency: 'CHF',
				additionalAmountChf: 500,
				contributions: [{ amountChf: 2_000 }, { amountChf: 5_733 }],
			},
		]);

		const statsById = expectSuccess(await service.getPublicCampaignStatsByIds(['campaign-1']));

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
		const { service, campaignFindMany, exchangeRateService } = createService({
			exchangeRates: { EUR: 0.8 },
		});

		campaignFindMany.mockResolvedValueOnce([
			{
				id: 'campaign-1',
				endDate,
				goal: 4_000,
				currency: 'EUR',
				additionalAmountChf: 500,
				contributions: [{ amountChf: 2_000 }],
			},
		]);

		const statsById = expectSuccess(await service.getPublicCampaignStatsByIds(['campaign-1']));

		expect(exchangeRateService.getLatestRateForCurrency).toHaveBeenCalledWith('EUR');
		expect(statsById['campaign-1']).toEqual({
			contributionsCount: 1,
			daysLeft: 30,
			amountCollected: 2_000,
			percentageCollected: 50,
		});
	});

	test('getPublicCampaignStatsByIds reuses an exchange rate for campaigns with the same currency', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		const { service, campaignFindMany, exchangeRateService } = createService({
			exchangeRates: { EUR: 0.8 },
		});

		campaignFindMany.mockResolvedValueOnce([
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

		expectSuccess(await service.getPublicCampaignStatsByIds(['campaign-1', 'campaign-2']));

		expect(exchangeRateService.getLatestRateForCurrency).toHaveBeenCalledTimes(1);
		expect(exchangeRateService.getLatestRateForCurrency).toHaveBeenCalledWith('EUR');
	});

	test('getPublicCampaignStatsByIds omits monetary stats when a non-CHF exchange rate is unavailable', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		const { service, campaignFindMany, exchangeRateService } = createService({ exchangeRates: {} });

		campaignFindMany.mockResolvedValueOnce([
			{
				id: 'campaign-1',
				endDate,
				goal: 2_000,
				currency: 'EUR',
				additionalAmountChf: null,
				contributions: [{ amountChf: 1_000 }],
			},
		]);

		const statsById = expectSuccess(await service.getPublicCampaignStatsByIds(['campaign-1']));

		expect(exchangeRateService.getLatestRateForCurrency).toHaveBeenCalledWith('EUR');
		expect(statsById['campaign-1']).toEqual({
			contributionsCount: 1,
			daysLeft: 30,
			amountCollected: null,
			percentageCollected: null,
		});
	});

	test('getPublicCampaignStatsByIds uses rate one for CHF without an exchange-rate lookup', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		const { service, campaignFindMany, exchangeRateService } = createService({ exchangeRates: {} });

		campaignFindMany.mockResolvedValueOnce([
			{
				id: 'campaign-1',
				endDate,
				goal: 2_000,
				currency: 'CHF',
				additionalAmountChf: null,
				contributions: [{ amountChf: 1_000 }],
			},
		]);

		const statsById = expectSuccess(await service.getPublicCampaignStatsByIds(['campaign-1']));

		expect(exchangeRateService.getLatestRateForCurrency).not.toHaveBeenCalled();
		expect(statsById['campaign-1']).toEqual({
			contributionsCount: 1,
			daysLeft: 30,
			amountCollected: 1_000,
			percentageCollected: 50,
		});
	});

	test('getPublicCampaignStatsByIds omits monetary stats when a non-CHF exchange rate is invalid', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		const { service, campaignFindMany } = createService({ exchangeRates: { EUR: 0 } });

		campaignFindMany.mockResolvedValueOnce([
			{
				id: 'campaign-1',
				endDate,
				goal: 2_000,
				currency: 'EUR',
				additionalAmountChf: null,
				contributions: [{ amountChf: 1_000 }],
			},
		]);

		const statsById = expectSuccess(await service.getPublicCampaignStatsByIds(['campaign-1']));

		expect(statsById['campaign-1']).toMatchObject({
			amountCollected: null,
			percentageCollected: null,
		});
	});

	test('getPublicCampaignStatsByIds omits percentage when campaign has no goal', async () => {
		const endDate = new Date('2025-07-15T12:00:00.000Z');
		const { service, campaignFindMany } = createService();

		campaignFindMany.mockResolvedValueOnce([
			{
				id: 'campaign-1',
				endDate,
				goal: null,
				currency: 'CHF',
				additionalAmountChf: null,
				contributions: [{ amountChf: 1_000 }],
			},
		]);

		const statsById = expectSuccess(await service.getPublicCampaignStatsByIds(['campaign-1']));

		expect(statsById['campaign-1']).toEqual({
			contributionsCount: 1,
			daysLeft: 30,
			amountCollected: 1_000,
			percentageCollected: null,
		});
	});

	test('getPublicCampaignStatsByIds clamps expired campaigns to zero days left', async () => {
		const endDate = new Date('2025-06-01T12:00:00.000Z');
		const { service, campaignFindMany } = createService();

		campaignFindMany.mockResolvedValueOnce([
			{
				id: 'campaign-1',
				endDate,
				goal: 1_000,
				currency: 'CHF',
				additionalAmountChf: null,
				contributions: [],
			},
		]);

		const statsById = expectSuccess(await service.getPublicCampaignStatsByIds(['campaign-1']));

		expect(statsById['campaign-1']?.daysLeft).toBe(0);
	});

	test('getPublicCampaignsWithStats returns empty stats map when stats query fails', async () => {
		const { service, campaignFindMany } = createService();

		campaignFindMany.mockResolvedValueOnce([
			{
				id: 'campaign-1',
				title: 'Holiday Fundraiser',
				slug: 'holiday-fundraiser',
				creatorName: 'smartive AG',
				currency: 'CHF',
				featured: true,
				createdAt: new Date('2025-01-01T00:00:00.000Z'),
			},
		]);
		campaignFindMany.mockRejectedValueOnce(new Error('stats unavailable'));

		const allResult = expectSuccess(
			await service.getPublicCampaignsWithStats([
				{
					id: 'campaign-1',
					title: 'Holiday Fundraiser',
					slug: 'holiday-fundraiser',
					creatorName: 'smartive AG',
					currency: 'CHF',
					isActive: true,
				},
			]),
		);

		expect(allResult.statsById).toEqual({});
		expect(allResult.campaigns).toHaveLength(1);
	});
});
