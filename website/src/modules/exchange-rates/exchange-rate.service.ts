import { Currency } from '@/generated/prisma/enums';
import {
	fetchEthUsdPrice,
	fetchFiatExchangeRates,
	type FiatExchangeRateResponse,
} from '@/integrations/exchange-rates/exchange-rate.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { isValidCurrency } from '@/lib/types/currency';
import { now, nowMs } from '@/lib/utils/now';
import { isAdmin } from '@/modules/users/user.service';
import { DateTime } from 'luxon';
import * as exchangeRateRepository from './exchange-rate.repository';
import type {
	ExchangeRate,
	ExchangeRateCreateInput,
	ExchangeRates,
	ExchangeRatesPaginatedTableView,
	ExchangeRatesTableViewRow,
	ExchangeRateTableQuery,
} from './exchange-rate.types';

const DAY_IN_MILLISECONDS = 60 * 60 * 24 * 1000;

export const getLatestRates = async (): Promise<ServiceResult<ExchangeRates>> => {
	try {
		const rates = await exchangeRateRepository.findLatestRates();
		if (rates.length === 0) {
			return resultFail('No exchange rates found');
		}

		return resultOk(Object.fromEntries(rates.map((rate) => [rate.currency, Number(rate.rate)])));
	} catch (error) {
		console.error('Could not fetch latest exchange rates', { error });

		return resultFail('Could not fetch latest exchange rates');
	}
};

export const getLatestRateForCurrency = async (currency: Currency): Promise<ServiceResult<ExchangeRate>> => {
	try {
		const rate = await exchangeRateRepository.findLatestRateForCurrency(currency);
		if (!rate) {
			return resultFail('No exchange rate found');
		}

		return resultOk({
			currency: rate.currency,
			rate: Number(rate.rate),
		});
	} catch (error) {
		console.error('Could not fetch latest exchange rate', { currency, error });

		return resultFail('Could not fetch latest exchange rate');
	}
};

export const getPaginatedExchangeRateTableView = async (
	userId: string,
	query: ExchangeRateTableQuery,
): Promise<ServiceResult<ExchangeRatesPaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const oneMonthAgo = now();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
		oneMonthAgo.setHours(0, 0, 0, 0);
		const { rates, totalCount, currencySource } = await exchangeRateRepository.findPaginatedExchangeRates(
			query,
			oneMonthAgo,
		);
		const tableRows: ExchangeRatesTableViewRow[] = rates.map((rate) => ({
			id: rate.id,
			currency: rate.currency,
			rate: Number(rate.rate),
			timestamp: rate.timestamp,
			createdAt: rate.createdAt,
		}));
		const currencyFilterOptions = Array.from(new Set(currencySource.map((rate) => rate.currency)))
			.sort()
			.map((currency) => ({ value: currency, label: currency }));

		return resultOk({ tableRows, totalCount, currencyFilterOptions });
	} catch (error) {
		console.error('Could not fetch exchange rates', { userId, error });

		return resultFail('Could not fetch exchange rates');
	}
};

export const triggerExchangeRateImportAsAdmin = async (userId: string): Promise<ServiceResult<void>> => {
	const isAdminResult = await isAdmin(userId);
	if (!isAdminResult.success) {
		return resultFail(isAdminResult.error);
	}

	return importExchangeRates();
};

export const importExchangeRates = async (): Promise<ServiceResult<void>> => {
	try {
		const oneMonthAgo = now();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
		const fromDate = new Date(oneMonthAgo);
		fromDate.setHours(0, 0, 0, 0);
		const existingExchangeRates = await exchangeRateRepository.findExchangeRatesSince(fromDate);

		console.info('Starting exchange rate import', {
			fromDate: oneMonthAgo.toISOString(),
			toDate: now().toISOString(),
		});

		for (let timestamp = oneMonthAgo.getTime(); timestamp <= nowMs(); timestamp += DAY_IN_MILLISECONDS) {
			const currentDate = new Date(timestamp);
			const hasRatesForTimestamp = existingExchangeRates.some(
				(rate) =>
					rate.timestamp.getUTCFullYear() === currentDate.getUTCFullYear() &&
					rate.timestamp.getUTCMonth() === currentDate.getUTCMonth() &&
					rate.timestamp.getUTCDate() === currentDate.getUTCDate(),
			);

			console.info('Checking exchange rates for timestamp', {
				date: DateTime.fromMillis(timestamp).toISODate(),
				found: hasRatesForTimestamp,
			});

			if (!hasRatesForTimestamp) {
				const storedRatesResult = await fetchAndStoreFiatExchangeRates(DateTime.fromMillis(timestamp));
				if (!storedRatesResult.success) {
					console.error('Could not store imported exchange rates', { error: storedRatesResult.error });

					return resultFail('Could not store exchange rates');
				}
			}
		}

		const ethImportResult = await importTodayEthExchangeRate();
		if (!ethImportResult.success) {
			console.error('Could not import ETH exchange rate', { error: ethImportResult.error });
		}

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not import exchange rates', { error });

		return resultFail('Could not import exchange rates');
	}
};

const fetchAndStoreFiatExchangeRates = async (date: DateTime): Promise<ServiceResult<FiatExchangeRateResponse>> => {
	const day = date.toFormat('yyyy-MM-dd');
	console.info('Fetching exchange rates for day', { day });
	const ratesResult = await fetchFiatExchangeRates(day);
	if (!ratesResult.success) {
		return ratesResult;
	}

	const storeResult = await storeFiatExchangeRates(ratesResult.data);
	if (!storeResult.success) {
		return resultFail(storeResult.error);
	}

	console.info('Ingested exchange rates for date', { date: date.toISODate() });

	return ratesResult;
};

const storeFiatExchangeRates = async (
	response: FiatExchangeRateResponse,
): Promise<ServiceResult<ExchangeRateCreateInput[]>> => {
	const data: ExchangeRateCreateInput[] = [];
	for (const [currency, rate] of Object.entries(response.rates)) {
		if (isValidCurrency(currency)) {
			data.push({
				currency,
				rate,
				timestamp: new Date(`${response.date}Z`),
			});
		}
	}

	try {
		await exchangeRateRepository.createExchangeRates(data);

		return resultOk(data);
	} catch (error) {
		console.error('Could not store exchange rates', { date: response.date, error });

		return resultFail('Could not store exchange rates');
	}
};

const importTodayEthExchangeRate = async (): Promise<ServiceResult<void>> => {
	try {
		const today = DateTime.utc().startOf('day');
		const tomorrow = today.plus({ days: 1 });
		const existingRates = await exchangeRateRepository.findDailyUsdAndEthRates(today.toJSDate(), tomorrow.toJSDate());

		if (existingRates.some(({ currency }) => currency === Currency.ETH)) {
			console.info('ETH exchange rate already exists for today');

			return resultOk(undefined);
		}

		let usdRate = existingRates.find(({ currency }) => currency === Currency.USD)?.rate.toNumber();
		if (usdRate === undefined) {
			const ratesResult = await fetchAndStoreFiatExchangeRates(today);
			if (!ratesResult.success) {
				console.error('Could not load USD exchange rate for ETH import', { error: ratesResult.error });

				return resultFail('Could not import ETH exchange rate');
			}
			usdRate = ratesResult.data.rates.USD;
		}
		if (usdRate === undefined || !Number.isFinite(usdRate) || usdRate <= 0) {
			return resultFail('Could not import ETH exchange rate: USD exchange rate for today is missing');
		}

		const ethUsdPriceResult = await fetchEthUsdPrice();
		if (!ethUsdPriceResult.success) {
			console.error('Could not load ETH price for exchange rate import', { error: ethUsdPriceResult.error });

			return resultFail('Could not import ETH exchange rate');
		}

		const ethRate = usdRate / ethUsdPriceResult.data;
		await exchangeRateRepository.createExchangeRate({
			currency: Currency.ETH,
			rate: ethRate,
			timestamp: today.toJSDate(),
		});
		console.info('Ingested ETH exchange rate for today', {
			date: today.toISODate(),
			rate: ethRate,
		});

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not import ETH exchange rate', { error });

		return resultFail('Could not import ETH exchange rate');
	}
};
