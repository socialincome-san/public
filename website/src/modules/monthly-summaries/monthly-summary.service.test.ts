import { PayoutInterval, PayoutStatus } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';
import type { ContributionSummary } from '@/modules/contributions/contribution.types';
import type { PayoutSummary } from '@/modules/payouts/payout.types';
import type {
	RecipientLifecycleStatus,
	RecipientLifecycleStatusInput,
	RecipientMonthlySummarySource,
} from '@/modules/recipients/recipient.types';

const mockGetSucceededContributionSummary = jest.fn<Promise<ServiceResult<ContributionSummary>>, []>();
const mockGetPaidPayoutSummary = jest.fn<Promise<ServiceResult<PayoutSummary>>, []>();
const mockCountContributorsCreatedBetween = jest.fn<Promise<ServiceResult<number>>, []>();
const mockCountCampaignsCreatedBetween = jest.fn<Promise<ServiceResult<number>>, []>();
const mockCountProgramsCreatedBetween = jest.fn<Promise<ServiceResult<number>>, []>();
const mockGetRecipientMonthlySummarySource = jest.fn<Promise<ServiceResult<RecipientMonthlySummarySource>>, []>();
const mockGetRecipientLifecycleStatus = jest.fn<ServiceResult<RecipientLifecycleStatus>, [RecipientLifecycleStatusInput]>();

jest.mock('@/modules/contributions/contribution.service', () => ({
	getSucceededContributionSummary: mockGetSucceededContributionSummary,
}));

jest.mock('@/modules/payouts/payout.service', () => ({
	getPaidPayoutSummary: mockGetPaidPayoutSummary,
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	countContributorsCreatedBetween: mockCountContributorsCreatedBetween,
}));

jest.mock('@/modules/campaigns/campaign.service', () => ({
	countCampaignsCreatedBetween: mockCountCampaignsCreatedBetween,
}));

jest.mock('@/modules/programs/program-reference.service', () => ({
	countProgramsCreatedBetween: mockCountProgramsCreatedBetween,
}));

jest.mock('@/modules/recipients/recipient.service', () => ({
	getRecipientMonthlySummarySource: mockGetRecipientMonthlySummarySource,
	recipientStatusService: {
		getRecipientLifecycleStatus: mockGetRecipientLifecycleStatus,
	},
}));

import { getLastMonthSummary } from './monthly-summary.service';

describe('getLastMonthSummary', () => {
	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2026-09-22T11:15:00.000Z'));
	});

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetSucceededContributionSummary.mockResolvedValue({
			success: true,
			data: { amountChf: 100, count: 2 },
		});
		mockGetPaidPayoutSummary.mockResolvedValue({ success: true, data: { amountChf: 80, count: 3 } });
		mockCountContributorsCreatedBetween.mockResolvedValue({ success: true, data: 4 });
		mockCountCampaignsCreatedBetween.mockResolvedValue({ success: true, data: 5 });
		mockCountProgramsCreatedBetween.mockResolvedValue({ success: true, data: 6 });
		mockGetRecipientMonthlySummarySource.mockResolvedValue({
			success: true,
			data: {
				newRecipientCount: 7,
				recipients: [
					{
						programId: 'program-1',
						startDate: new Date('2026-01-01T00:00:00.000Z'),
						suspendedAt: null,
						program: {
							programDurationInMonths: 12,
							payoutInterval: PayoutInterval.monthly,
							country: { isoCode: 'SL' },
						},
						localPartner: { name: 'Partner' },
						payouts: [{ status: PayoutStatus.confirmed }, { status: PayoutStatus.failed }],
					},
				],
			},
		});
		mockGetRecipientLifecycleStatus.mockReturnValue({ success: true, data: 'completed' });
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('loads and aggregates last month numbers', async () => {
		const result = await getLastMonthSummary();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.period).toEqual({
			from: new Date('2026-08-01T00:00:00.000Z'),
			to: new Date('2026-09-01T00:00:00.000Z'),
		});
		expect(result.data.moneyIn).toEqual({ amountChf: 100, count: 2 });
		expect(result.data.moneyOut).toEqual({ amountChf: 80, count: 3 });
		expect(result.data.new).toEqual({ contributors: 4, campaigns: 5, programs: 6, recipients: 7 });
		expect(result.data.stats.overall).toEqual({
			recipients: { active: 0, former: 1, suspended: 0, future: 0 },
			candidates: 0,
			payouts: { total: 1, confirmed: 1, contested: 0, failed: 1 },
		});
		expect(result.data.stats.countries.SL).toEqual(result.data.stats.overall);
		expect(result.data.stats.localPartners).toEqual([
			{
				name: 'Partner',
				countryIsoCodes: ['SL'],
				programs: 1,
				stats: result.data.stats.overall,
			},
		]);
	});

	test('counts candidates separately from recipients', async () => {
		mockGetRecipientMonthlySummarySource.mockResolvedValue({
			success: true,
			data: {
				newRecipientCount: 0,
				recipients: [
					{
						programId: null,
						startDate: null,
						suspendedAt: null,
						program: null,
						localPartner: { name: 'Partner' },
						payouts: [],
					},
				],
			},
		});

		const result = await getLastMonthSummary();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.stats.overall.candidates).toBe(1);
		expect(result.data.stats.overall.recipients).toEqual({
			active: 0,
			former: 0,
			suspended: 0,
			future: 0,
		});
	});

	test('returns a dependency failure without exposing thrown errors', async () => {
		mockCountProgramsCreatedBetween.mockResolvedValue({ success: false, error: 'Could not count programs' });

		await expect(getLastMonthSummary()).resolves.toEqual({
			success: false,
			error: 'Could not count programs',
		});
	});
});
