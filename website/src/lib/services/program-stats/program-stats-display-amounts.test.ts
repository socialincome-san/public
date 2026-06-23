import { type PrismaClient } from '@/generated/prisma/client';
import type { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import type { RecipientStatusService } from '../recipient/recipient-status.service';
import { ProgramStatsService } from './program-stats.service';
import type { ProgramDashboardStats } from './program-stats.types';

jest.mock('@/generated/prisma/client', () => ({
	ContributionStatus: {},
	Currency: {},
	PaymentEventType: {},
	PayoutInterval: {},
	PayoutStatus: {},
	PrismaClient: class {},
	SurveyStatus: {},
}));

const baseStats: ProgramDashboardStats = {
	contributedToProgramSoFarChf: 0,
	contributedViaStripeChf: 0,
	contributedViaWireTransferChf: 0,
	contributedViaOthersChf: 0,
	totalProgramCostsChf: 1200,
	contributionsCount: 0,
	contributorsCount: 0,
	averageContributionChf: 0,
	fundingProgressPercent: 0,
	paidOutSoFarChf: 1000,
	paidOutSoFarProgramCurrency: 24000,
	totalPayoutsCount: 0,
	payoutsDoneCount: 0,
	remainingPayoutsCount: 0,
	remainingIntervalsCount: 0,
	payoutPerInterval: 800,
	payoutInterval: 'monthly',
	payoutCurrency: 'SLE',
	costPerIntervalChf: 0,
	costPerIntervalProgramCurrency: 0,
	payoutProgressPercent: 50,
	totalProgramCostsProgramCurrency: 28800,
	availableCreditsChf: 200,
	availableCreditsProgramCurrency: 4800,
	availableCreditsInIntervals: 2,
	totalExpectedIntervals: 12,
	completedSurveysCount: 0,
	totalSurveysCount: 0,
	surveyCompletionPercent: 0,
	futureRecipientsCount: 0,
	activeRecipientsCount: 0,
	suspendedRecipientsCount: 0,
	completedRecipientsCount: 0,
	programDurationInMonths: 12,
	recipientsCount: 1,
};

const createService = (exchangeRates?: Record<string, number>) => {
	const getLatestRates = jest.fn().mockResolvedValue(
		exchangeRates ? { success: true as const, data: exchangeRates } : { success: false as const, error: 'No rates' },
	);
	const exchangeRateService = { getLatestRates };

	const recipientStatusService = {} as RecipientStatusService;
	const db = {} as PrismaClient;

	return {
		service: new ProgramStatsService(db, exchangeRateService as unknown as ExchangeRateReadService, recipientStatusService),
		getLatestRates,
	};
};

describe('ProgramStatsService.resolveDisplayAmounts', () => {
	it('returns CHF fields when display currency is CHF', async () => {
		const { service, getLatestRates } = createService();

		const result = await service.resolveDisplayAmounts(baseStats, 'CHF');

		expect(result).toEqual({
			currency: 'CHF',
			paidOutSoFar: 1000,
			totalProgramCosts: 1200,
			availableCredits: 200,
		});
		expect(getLatestRates).not.toHaveBeenCalled();
	});

	it('returns program-currency fields when display currency matches payout currency', async () => {
		const { service, getLatestRates } = createService();
		const usdStats = { ...baseStats, payoutCurrency: 'USD' as const };

		const result = await service.resolveDisplayAmounts(usdStats, 'USD');

		expect(result).toEqual({
			currency: 'USD',
			paidOutSoFar: 24000,
			totalProgramCosts: 28800,
			availableCredits: 4800,
		});
		expect(getLatestRates).not.toHaveBeenCalled();
	});

	it('converts from CHF when display currency differs from payout currency and rates are available', async () => {
		const { service } = createService({ CHF: 1, USD: 1.1, EUR: 0.9, SLE: 24 });

		const result = await service.resolveDisplayAmounts(baseStats, 'USD');

		expect(result.currency).toBe('USD');
		expect(result.paidOutSoFar).toBeCloseTo(1100);
		expect(result.totalProgramCosts).toBeCloseTo(1320);
		expect(result.availableCredits).toBeCloseTo(220);
	});

	it.each([
		{ label: 'exchange rates are missing', exchangeRates: undefined },
		{ label: 'target currency rate is missing', exchangeRates: { CHF: 1, USD: 1.1 } },
	])('falls back to payout currency when $label', async ({ exchangeRates }) => {
		const { service } = createService(exchangeRates);

		const result = await service.resolveDisplayAmounts(baseStats, 'EUR');

		expect(result).toEqual({
			currency: 'SLE',
			paidOutSoFar: 24000,
			totalProgramCosts: 28800,
			availableCredits: 4800,
		});
	});
});
