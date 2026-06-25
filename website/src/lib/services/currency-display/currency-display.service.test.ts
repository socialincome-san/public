import type { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import { CurrencyDisplayService } from './currency-display.service';

const createService = (exchangeRates?: Record<string, number>) => {
	const getLatestRates = jest
		.fn()
		.mockResolvedValue(
			exchangeRates ? { success: true as const, data: exchangeRates } : { success: false as const, error: 'No rates' },
		);
	const exchangeRateService = { getLatestRates };

	return {
		service: new CurrencyDisplayService(exchangeRateService as unknown as ExchangeRateReadService),
		getLatestRates,
	};
};

describe('CurrencyDisplayService.resolveFromChf', () => {
	it('returns CHF without fetching rates when display currency is CHF', async () => {
		const { service, getLatestRates } = createService();

		const result = await service.resolveFromChf(1000, 'CHF');

		expect(result).toEqual({ amount: 1000, currency: 'CHF' });
		expect(getLatestRates).not.toHaveBeenCalled();
	});

	it('converts CHF to USD when rates are provided', async () => {
		const { service, getLatestRates } = createService();

		const result = await service.resolveFromChf(1000, 'USD', { CHF: 1, USD: 1.1, EUR: 0.9 });

		expect(result.currency).toBe('USD');
		expect(result.amount).toBeCloseTo(1100);
		expect(getLatestRates).not.toHaveBeenCalled();
	});

	it('converts CHF to USD when rates are available', async () => {
		const { service } = createService({ CHF: 1, USD: 1.1, EUR: 0.9 });

		const result = await service.resolveFromChf(1000, 'USD');

		expect(result.currency).toBe('USD');
		expect(result.amount).toBeCloseTo(1100);
	});

	it('falls back to CHF when exchange rates are missing', async () => {
		const { service } = createService();

		const result = await service.resolveFromChf(1000, 'EUR');

		expect(result).toEqual({ amount: 1000, currency: 'CHF' });
	});

	it('falls back to CHF when target currency rate is missing', async () => {
		const { service } = createService({ CHF: 1, USD: 1.1 });

		const result = await service.resolveFromChf(1000, 'EUR');

		expect(result).toEqual({ amount: 1000, currency: 'CHF' });
	});
});

describe('CurrencyDisplayService.resolveWalletPayoutDisplay', () => {
	const walletInput = {
		totalPayoutsSum: 24000,
		totalPayoutsSumChf: 1000,
		payoutCurrency: 'SLE' as const,
	};

	it('returns payout-native amount when display currency matches payout currency', () => {
		const { service, getLatestRates } = createService();

		const result = service.resolveWalletPayoutDisplay({
			...walletInput,
			displayCurrency: 'SLE',
		});

		expect(result).toEqual({ amount: 24000, currency: 'SLE' });
		expect(getLatestRates).not.toHaveBeenCalled();
	});

	it('returns CHF amount when display currency is CHF', () => {
		const { service, getLatestRates } = createService();

		const result = service.resolveWalletPayoutDisplay({
			...walletInput,
			displayCurrency: 'CHF',
		});

		expect(result).toEqual({ amount: 1000, currency: 'CHF' });
		expect(getLatestRates).not.toHaveBeenCalled();
	});

	it('converts from CHF when display currency differs from payout currency and rates are available', () => {
		const { service } = createService({ CHF: 1, USD: 1.1, EUR: 0.9, SLE: 24 });

		const result = service.resolveWalletPayoutDisplay(
			{
				...walletInput,
				displayCurrency: 'USD',
			},
			{ CHF: 1, USD: 1.1, EUR: 0.9, SLE: 24 },
		);

		expect(result.currency).toBe('USD');
		expect(result.amount).toBeCloseTo(1100);
	});

	it.each([
		{ label: 'exchange rates are missing', exchangeRates: undefined },
		{ label: 'target currency rate is missing', exchangeRates: { CHF: 1, USD: 1.1 } },
	])('falls back to payout currency when $label', ({ exchangeRates }) => {
		const { service } = createService(exchangeRates);

		const result = service.resolveWalletPayoutDisplay(
			{
				...walletInput,
				displayCurrency: 'EUR',
			},
			exchangeRates,
		);

		expect(result).toEqual({ amount: 24000, currency: 'SLE' });
	});
});

describe('CurrencyDisplayService.fetchWalletPayoutDisplayRates', () => {
	it('does not fetch rates when display currency is CHF', async () => {
		const { service, getLatestRates } = createService();

		const rates = await service.fetchWalletPayoutDisplayRates('CHF');

		expect(rates).toBeUndefined();
		expect(getLatestRates).not.toHaveBeenCalled();
	});

	it('fetches rates when display currency is not CHF', async () => {
		const { service, getLatestRates } = createService({ CHF: 1, USD: 1.1 });

		const rates = await service.fetchWalletPayoutDisplayRates('USD');

		expect(rates).toEqual({ CHF: 1, USD: 1.1 });
		expect(getLatestRates).toHaveBeenCalledTimes(1);
	});
});

describe('CurrencyDisplayService.convertAmount', () => {
	it('returns the same amount for identical currencies', () => {
		const { service } = createService();

		expect(service.convertAmount(500, 'CHF', 'CHF', { CHF: 1 })).toBe(500);
	});

	it('returns undefined when rates are missing', () => {
		const { service } = createService();

		expect(service.convertAmount(500, 'CHF', 'USD')).toBeUndefined();
	});
});
