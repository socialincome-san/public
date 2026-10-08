const mockGetLatestRates = jest.fn();

jest.mock('@/modules/exchange-rates/exchange-rate.service', () => ({
	getLatestRates: mockGetLatestRates,
}));

import { convertAmount, resolveChfAmounts, resolveWalletPayoutDisplays } from './currency-display.service';

describe('currency display service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('converts amounts with valid rates', () => {
		expect(convertAmount(1_000, 'CHF', 'USD', { CHF: 1, USD: 1.1 })).toEqual({
			success: true,
			data: 1_100,
		});
	});

	test('returns a stable failure for missing or invalid rates', () => {
		expect(convertAmount(500, 'CHF', 'USD')).toEqual({
			success: false,
			error: 'Exchange rates are unavailable',
		});
		expect(convertAmount(500, 'CHF', 'USD', { CHF: 0, USD: 1.1 })).toEqual({
			success: false,
			error: 'Exchange rates are unavailable',
		});
	});

	test('resolves CHF amounts in every website currency with one rates lookup', async () => {
		mockGetLatestRates.mockResolvedValue({ success: true, data: { CHF: 1, EUR: 0.9, USD: 1.1 } });

		await expect(resolveChfAmounts({ amounts: [1_000, 50] })).resolves.toEqual({
			success: true,
			data: {
				CHF: [
					{ amount: 1_000, currency: 'CHF' },
					{ amount: 50, currency: 'CHF' },
				],
				EUR: [
					{ amount: 900, currency: 'EUR' },
					{ amount: 45, currency: 'EUR' },
				],
				USD: [
					{ amount: 1_100, currency: 'USD' },
					{ amount: 55.00000000000001, currency: 'USD' },
				],
			},
		});
		expect(mockGetLatestRates).toHaveBeenCalledTimes(1);
	});

	test('falls back to CHF when rates are unavailable', async () => {
		mockGetLatestRates.mockResolvedValue({ success: false, error: 'No rates' });

		const result = await resolveChfAmounts({ amounts: [1_000] });

		expect(result.success && result.data.EUR).toEqual([{ amount: 1_000, currency: 'CHF' }]);
	});

	test('preserves native wallet payout fallback behavior', async () => {
		mockGetLatestRates.mockResolvedValue({ success: false, error: 'No rates' });

		const result = await resolveWalletPayoutDisplays([
			{ totalPayoutsSum: 24_000, totalPayoutsSumChf: 1_000, payoutCurrency: 'SLE' },
		]);

		expect(result.success && result.data).toEqual({
			CHF: [{ amount: 1_000, currency: 'CHF' }],
			EUR: [{ amount: 24_000, currency: 'SLE' }],
			USD: [{ amount: 24_000, currency: 'SLE' }],
		});
	});
});
