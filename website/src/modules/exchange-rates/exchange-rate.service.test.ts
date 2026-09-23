import { Currency } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

const mockFetchEthUsdPrice = jest.fn();
const mockFetchFiatExchangeRates = jest.fn();
const mockIsAdmin = jest.fn();
const mockFindLatestRates = jest.fn();
const mockFindLatestRateForCurrency = jest.fn();
const mockFindPaginatedExchangeRates = jest.fn();
const mockFindExchangeRatesSince = jest.fn();
const mockFindDailyUsdAndEthRates = jest.fn();
const mockCreateExchangeRates = jest.fn();
const mockCreateExchangeRate = jest.fn();

jest.mock('@/integrations/exchange-rates/exchange-rate.integration', () => ({
	fetchEthUsdPrice: mockFetchEthUsdPrice,
	fetchFiatExchangeRates: mockFetchFiatExchangeRates,
}));

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('./exchange-rate.repository', () => ({
	findLatestRates: mockFindLatestRates,
	findLatestRateForCurrency: mockFindLatestRateForCurrency,
	findPaginatedExchangeRates: mockFindPaginatedExchangeRates,
	findExchangeRatesSince: mockFindExchangeRatesSince,
	findDailyUsdAndEthRates: mockFindDailyUsdAndEthRates,
	createExchangeRates: mockCreateExchangeRates,
	createExchangeRate: mockCreateExchangeRate,
}));

import { getLatestRates, getPaginatedExchangeRateTableView, importExchangeRates } from './exchange-rate.service';

const fixedTime = '2025-01-01T13:00:00.000Z';
const systemTime = '2026-08-14T12:00:00.000Z';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

describe('exchange rate service', () => {
	const originalFixedTime = process.env.NEXT_PUBLIC_FIXED_TIME;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers().setSystemTime(new Date(systemTime));
		jest.spyOn(console, 'info').mockImplementation(() => undefined);
		process.env.NEXT_PUBLIC_FIXED_TIME = fixedTime;
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockCreateExchangeRates.mockResolvedValue({ count: 2 });
		mockCreateExchangeRate.mockResolvedValue({ id: 'rate-1' });
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	afterAll(() => {
		if (originalFixedTime === undefined) {
			delete process.env.NEXT_PUBLIC_FIXED_TIME;
		} else {
			process.env.NEXT_PUBLIC_FIXED_TIME = originalFixedTime;
		}
	});

	test('maps the latest persisted rates to numbers', async () => {
		mockFindLatestRates.mockResolvedValue([
			{ currency: Currency.CHF, rate: 1 },
			{ currency: Currency.USD, rate: 1.12 },
		]);

		const result = await getLatestRates();

		expect(expectSuccess(result)).toEqual({ CHF: 1, USD: 1.12 });
	});

	test('requires admin access for the table view', async () => {
		mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });

		const result = await getPaginatedExchangeRateTableView('user-1', {
			page: 1,
			pageSize: 10,
			search: '',
		});

		expect(result).toEqual({ success: false, error: 'Permission denied', status: undefined });
		expect(mockFindPaginatedExchangeRates).not.toHaveBeenCalled();
	});

	test('converts ETH/USD into ETH per CHF and stores it for the current day', async () => {
		mockFindExchangeRatesSince.mockResolvedValue(createDailyRates());
		mockFindDailyUsdAndEthRates.mockResolvedValue([{ currency: Currency.USD, rate: { toNumber: () => 1.12 } }]);
		mockFetchEthUsdPrice.mockResolvedValue({ success: true, data: 1873.42 });

		await expect(importExchangeRates()).resolves.toEqual({
			success: true,
			data: undefined,
			status: undefined,
		});
		expect(mockCreateExchangeRate).toHaveBeenCalledWith({
			currency: Currency.ETH,
			rate: 1.12 / 1873.42,
			timestamp: new Date('2026-08-14T00:00:00.000Z'),
		});
		expect(mockFetchFiatExchangeRates).not.toHaveBeenCalled();
	});

	test('keeps the fiat import successful when the ETH provider fails', async () => {
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		mockFindExchangeRatesSince.mockResolvedValue(createDailyRates());
		mockFindDailyUsdAndEthRates.mockResolvedValue([{ currency: Currency.USD, rate: { toNumber: () => 1.12 } }]);
		mockFetchEthUsdPrice.mockResolvedValue({ success: false, error: 'Etherscan request failed' });

		await expect(importExchangeRates()).resolves.toEqual({
			success: true,
			data: undefined,
			status: undefined,
		});
		expect(mockCreateExchangeRate).not.toHaveBeenCalled();
	});
});

const createDailyRates = () => {
	const rates: { currency: Currency; rate: { toNumber: () => number }; timestamp: Date }[] = [];
	const start = new Date(fixedTime);
	start.setMonth(start.getMonth() - 1);

	for (let timestamp = start.getTime(); timestamp <= new Date(fixedTime).getTime(); timestamp += 60 * 60 * 24 * 1000) {
		rates.push({
			currency: Currency.USD,
			rate: { toNumber: () => 1.12 },
			timestamp: new Date(timestamp),
		});
	}

	return rates;
};
