import { fetchEthUsdPrice, fetchFiatExchangeRates } from './exchange-rate.integration';

describe('exchange rate integration', () => {
	const originalExchangeRatesApiKey = process.env.EXCHANGE_RATES_API;
	const originalEtherscanApiKey = process.env.ETHERSCAN_API_KEY;
	const originalFetch = global.fetch;

	beforeEach(() => {
		process.env.EXCHANGE_RATES_API = 'test-exchange-rates-key';
		process.env.ETHERSCAN_API_KEY = 'test-etherscan-key';
	});

	afterEach(() => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	afterAll(() => {
		restoreEnvironmentVariable('EXCHANGE_RATES_API', originalExchangeRatesApiKey);
		restoreEnvironmentVariable('ETHERSCAN_API_KEY', originalEtherscanApiKey);
	});

	test('fetches and validates fiat exchange rates', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({
				base: 'CHF',
				date: '2026-08-14',
				rates: { CHF: 1, USD: 1.22 },
			}),
		});

		await expect(fetchFiatExchangeRates('2026-08-14')).resolves.toEqual({
			success: true,
			data: {
				base: 'CHF',
				date: '2026-08-14',
				rates: { CHF: 1, USD: 1.22 },
			},
			status: undefined,
		});
		expect(global.fetch).toHaveBeenCalledWith('https://api.apilayer.com/exchangerates_data/2026-08-14?base=chf', {
			method: 'GET',
			headers: { apiKey: 'test-exchange-rates-key' },
		});
	});

	test('fetches and validates the ETH/USD price', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({
				status: '1',
				message: 'OK',
				result: { ethusd: '1873.42' },
			}),
		});

		await expect(fetchEthUsdPrice()).resolves.toEqual({
			success: true,
			data: 1873.42,
			status: undefined,
		});
		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.etherscan.io/v2/api?module=stats&action=ethprice&chainid=1&apikey=test-etherscan-key',
			{ method: 'GET' },
		);
	});

	test('rejects invalid provider responses', async () => {
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({ rates: { USD: 'invalid' } }),
		});

		await expect(fetchFiatExchangeRates('2026-08-14')).resolves.toEqual({
			success: false,
			error: 'Exchange rates provider returned an invalid response',
			status: undefined,
		});
	});
});

const restoreEnvironmentVariable = (name: string, value: string | undefined): void => {
	if (value === undefined) {
		delete process.env[name];
	} else {
		process.env[name] = value;
	}
};
