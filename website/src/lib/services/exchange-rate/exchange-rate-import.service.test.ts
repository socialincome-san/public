import type { PrismaClient } from '@/generated/prisma/client';
import { ExchangeRateImportService } from './exchange-rate-import.service';

const fixedTime = '2025-01-01T13:00:00.000Z';
const systemTime = '2026-08-14T12:00:00.000Z';

const createDailyRates = () => {
	const rates = [];
	const start = new Date(fixedTime);
	start.setMonth(start.getMonth() - 1);

	for (
		let timestamp = start.getTime();
		timestamp <= new Date(fixedTime).getTime();
		timestamp += ExchangeRateImportService.DAY_IN_MILLISECONDS
	) {
		rates.push({
			currency: 'USD',
			rate: { toNumber: () => 1.12 },
			timestamp: new Date(timestamp),
		});
	}

	return rates;
};

describe('ExchangeRateImportService ETH import', () => {
	const originalApiKey = process.env.ETHERSCAN_API_KEY;
	const originalExchangeRatesApiKey = process.env.EXCHANGE_RATES_API;
	const originalFixedTime = process.env.NEXT_PUBLIC_FIXED_TIME;
	const originalFetch = global.fetch;

	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(new Date(systemTime));
		process.env.ETHERSCAN_API_KEY = 'test-etherscan-key';
		process.env.EXCHANGE_RATES_API = 'test-exchange-rates-key';
		process.env.NEXT_PUBLIC_FIXED_TIME = fixedTime;
	});

	afterEach(() => {
		jest.useRealTimers();
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	afterAll(() => {
		if (originalApiKey === undefined) {
			delete process.env.ETHERSCAN_API_KEY;
		} else {
			process.env.ETHERSCAN_API_KEY = originalApiKey;
		}
		if (originalExchangeRatesApiKey === undefined) {
			delete process.env.EXCHANGE_RATES_API;
		} else {
			process.env.EXCHANGE_RATES_API = originalExchangeRatesApiKey;
		}
		if (originalFixedTime === undefined) {
			delete process.env.NEXT_PUBLIC_FIXED_TIME;
		} else {
			process.env.NEXT_PUBLIC_FIXED_TIME = originalFixedTime;
		}
	});

	const setup = (todayRates: { currency: string; rate: { toNumber: () => number } }[]) => {
		const findMany = jest.fn().mockResolvedValueOnce(createDailyRates()).mockResolvedValueOnce(todayRates);
		const create = jest.fn().mockResolvedValue({});
		const createMany = jest.fn();
		const db = { exchangeRate: { findMany, create, createMany } };
		const logger = { info: jest.fn(), error: jest.fn() };
		const service = new ExchangeRateImportService(db as unknown as PrismaClient, logger as never);

		return { create, createMany, findMany, logger, service };
	};

	test('converts ETH/USD into ETH per CHF and stores it for today', async () => {
		const { create, createMany, service } = setup([{ currency: 'USD', rate: { toNumber: () => 1.12 } }]);
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({
				status: '1',
				message: 'OK',
				result: { ethusd: '1873.42' },
			}),
		});

		await expect(service.import()).resolves.toEqual({ success: true, data: undefined });
		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.etherscan.io/v2/api?module=stats&action=ethprice&chainid=1&apikey=test-etherscan-key',
			{ method: 'GET' },
		);
		expect(create).toHaveBeenCalledWith({
			data: {
				currency: 'ETH',
				rate: 1.12 / 1873.42,
				timestamp: new Date('2026-08-14T00:00:00.000Z'),
			},
		});
		expect(createMany).not.toHaveBeenCalled();
	});

	test('skips the Etherscan request when today already has an ETH rate', async () => {
		const { create, service } = setup([{ currency: 'ETH', rate: { toNumber: () => 0.0006 } }]);
		global.fetch = jest.fn();

		await expect(service.import()).resolves.toEqual({ success: true, data: undefined });
		expect(global.fetch).not.toHaveBeenCalled();
		expect(create).not.toHaveBeenCalled();
	});

	test('fetches current fiat rates instead of combining ETH with the app fixed date', async () => {
		const { create, createMany, service } = setup([]);
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({
					base: 'CHF',
					date: '2026-08-14',
					rates: { CHF: 1, USD: 1.22 },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: jest.fn().mockResolvedValue({
					status: '1',
					message: 'OK',
					result: { ethusd: '1873.42' },
				}),
			});

		await expect(service.import()).resolves.toEqual({ success: true, data: undefined });
		expect(global.fetch).toHaveBeenNthCalledWith(
			1,
			'https://api.apilayer.com/exchangerates_data/2026-08-14?base=chf',
			expect.any(Object),
		);
		expect(createMany).toHaveBeenCalled();
		expect(create).toHaveBeenCalledWith({
			data: {
				currency: 'ETH',
				rate: 1.22 / 1873.42,
				timestamp: new Date('2026-08-14T00:00:00.000Z'),
			},
		});
	});

	test('keeps the fiat import successful when Etherscan fails', async () => {
		const { create, logger, service } = setup([{ currency: 'USD', rate: { toNumber: () => 1.12 } }]);
		global.fetch = jest.fn().mockResolvedValue({
			ok: false,
			status: 503,
			statusText: 'Service Unavailable',
		});

		await expect(service.import()).resolves.toEqual({ success: true, data: undefined });
		expect(create).not.toHaveBeenCalled();
		expect(logger.error).toHaveBeenCalled();
	});
});
