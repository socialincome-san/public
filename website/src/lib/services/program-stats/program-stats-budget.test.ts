import { type PrismaClient } from '@/generated/prisma/client';
import { CurrencyDisplayService } from '../currency-display/currency-display.service';
import type { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import type { RecipientStatusService } from '../recipient/recipient-status.service';
import { ProgramStatsService } from './program-stats.service';
import type { ProgramBudgetCalculation, ProgramBudgetCalculationInput } from './program-stats.types';

jest.mock('@/generated/prisma/client', () => ({
	ContributionStatus: {},
	Currency: {},
	PaymentEventType: {},
	PayoutInterval: {},
	PayoutStatus: {},
	PrismaClient: class {},
	SurveyStatus: {},
}));

const budgetInput: ProgramBudgetCalculationInput = {
	amountOfRecipients: 20,
	programDuration: 36,
	defaultPayoutPerInterval: 600,
	payoutPerInterval: 600,
	payoutInterval: 'monthly',
	payoutCurrency: 'SLE',
	displayCurrency: 'CHF',
};

const rates = { CHF: 1, USD: 0.85, EUR: 0.95, SLE: 24, LRD: 203 };

const createService = (exchangeRates?: Record<string, number>) => {
	const getLatestRates = jest
		.fn()
		.mockResolvedValue(
			exchangeRates ? { success: true as const, data: exchangeRates } : { success: false as const, error: 'No rates' },
		);
	const currencyDisplay = new CurrencyDisplayService({ getLatestRates } as unknown as ExchangeRateReadService);

	return new ProgramStatsService({} as PrismaClient, currencyDisplay, {} as RecipientStatusService);
};

const calculateBudget = async (
	service: ProgramStatsService,
	input: ProgramBudgetCalculationInput = budgetInput,
): Promise<ProgramBudgetCalculation> => {
	const result = await service.calculateProgramBudget(input);
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

describe('ProgramStatsService.calculateProgramBudget', () => {
	it('returns payoutToDisplayRate when payout and display currencies differ', async () => {
		const data = await calculateBudget(createService(rates));

		expect(data.payoutToDisplayRate).toBeCloseTo(1 / 24);
		expect(data.exchangeRateText).toBe(`1 SLE = ${Number((1 / 24).toFixed(4))} CHF`);
	});

	it('omits payoutToDisplayRate when payout and display currencies match', async () => {
		const data = await calculateBudget(createService(rates), {
			...budgetInput,
			payoutCurrency: 'CHF',
			displayCurrency: 'CHF',
		});

		expect(data.payoutToDisplayRate).toBeUndefined();
		expect(data.exchangeRateText).toBe('1 CHF = 1 CHF');
	});

	it.each([
		{ label: 'exchange rates are missing', exchangeRates: undefined },
		{ label: 'a required rate is missing', exchangeRates: { CHF: 1, USD: 0.85 } },
	])('omits payoutToDisplayRate when $label', async ({ exchangeRates }) => {
		const data = await calculateBudget(createService(exchangeRates));

		expect(data.payoutToDisplayRate).toBeUndefined();
		expect(data.exchangeRateText).toBeUndefined();
	});
});
