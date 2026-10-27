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
		jest.useRealTimers();
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
		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.apilayer.com/exchangerates_data/2026-08-14?base=chf',
			expect.objectContaining({ method: 'GET', headers: { apiKey: 'test-exchange-rates-key' } }),
		);
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	test.each([408, 500, 502, 503, 504])('retries HTTP %i after a delay and stops on success', async (status) => {
		jest.useFakeTimers();
		jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		const data = { base: 'CHF', date: '2026-08-14', rates: { CHF: 1, USD: 1.22 } };
		const cancel = jest.fn().mockResolvedValue(undefined);
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce({ ok: false, status, statusText: 'Transient failure', body: { cancel } })
			.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(data) });

		const result = fetchFiatExchangeRates('2026-08-14');
		await jest.advanceTimersByTimeAsync(1999);
		expect(global.fetch).toHaveBeenCalledTimes(1);
		await jest.advanceTimersByTimeAsync(1);

		await expect(result).resolves.toEqual({ success: true, data, status: undefined });
		expect(global.fetch).toHaveBeenCalledTimes(2);
		expect(cancel).toHaveBeenCalledTimes(1);
	});

	test('stops after five failed provider requests', async () => {
		jest.useFakeTimers();
		jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 504, statusText: 'Gateway Timeout' });

		const result = fetchFiatExchangeRates('2026-08-14');
		await jest.runAllTimersAsync();

		await expect(result).resolves.toEqual({
			success: false,
			error: 'Exchange rates provider request failed',
			status: undefined,
		});
		expect(global.fetch).toHaveBeenCalledTimes(5);
		expect(console.warn).toHaveBeenCalledTimes(4);
		expect(console.error).toHaveBeenCalledTimes(1);
		expect(jest.getTimerCount()).toBe(0);
	});

	test('accepts success on the fifth attempt after network failures', async () => {
		jest.useFakeTimers();
		jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		const data = { base: 'CHF', date: '2026-08-14', rates: { CHF: 1, USD: 1.22 } };
		global.fetch = jest
			.fn()
			.mockRejectedValueOnce(new TypeError('Network error'))
			.mockRejectedValueOnce(new TypeError('Network error'))
			.mockRejectedValueOnce(new TypeError('Network error'))
			.mockRejectedValueOnce(new TypeError('Network error'))
			.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(data) });

		const result = fetchFiatExchangeRates('2026-08-14');
		await jest.runAllTimersAsync();

		await expect(result).resolves.toEqual({ success: true, data, status: undefined });
		expect(global.fetch).toHaveBeenCalledTimes(5);
	});

	test('does not request rates without an API key', async () => {
		delete process.env.EXCHANGE_RATES_API;
		global.fetch = jest.fn();

		await expect(fetchFiatExchangeRates('2026-08-14')).resolves.toEqual({
			success: false,
			error: 'Exchange rates API is not configured',
			status: undefined,
		});
		expect(global.fetch).not.toHaveBeenCalled();
	});

	test.each([400, 401, 403, 404, 429])('does not retry HTTP %i', async (status) => {
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		global.fetch = jest.fn().mockResolvedValue({ ok: false, status, statusText: 'Request rejected' });

		await expect(fetchFiatExchangeRates('2026-08-14')).resolves.toEqual({
			success: false,
			error: 'Exchange rates provider request failed',
			status: undefined,
		});
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	test.each([new TypeError('Network error'), new DOMException('Request timed out', 'TimeoutError')])(
		'retries rejected requests and stops after five attempts: %s',
		async (error) => {
			jest.useFakeTimers();
			jest.spyOn(console, 'warn').mockImplementation(() => undefined);
			jest.spyOn(console, 'error').mockImplementation(() => undefined);
			const timeout = jest.spyOn(AbortSignal, 'timeout');
			global.fetch = jest.fn().mockRejectedValue(error);

			const result = fetchFiatExchangeRates('2026-08-14');
			await jest.runAllTimersAsync();

			await expect(result).resolves.toEqual({
				success: false,
				error: 'Could not fetch exchange rates',
				status: undefined,
			});
			expect(global.fetch).toHaveBeenCalledTimes(5);
			expect(timeout).toHaveBeenCalledTimes(5);
			expect(timeout).toHaveBeenCalledWith(30_000);
			expect(console.error).toHaveBeenCalledTimes(1);
		},
	);

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
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});
});

const restoreEnvironmentVariable = (name: string, value: string | undefined): void => {
	if (value === undefined) {
		delete process.env[name];
	} else {
		process.env[name] = value;
	}
};
