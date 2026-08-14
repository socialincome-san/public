/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExchangeRate } from '@/generated/prisma/client';
import { isValidCurrency } from '@/lib/types/currency';
import { now, nowMs } from '@/lib/utils/now';
import { DateTime } from 'luxon';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateCreateInput, ExchangeRateResponse } from './exchange-rate.types';

type EtherscanEthPriceResponse = {
	status: string;
	message: string;
	result: {
		ethusd: string;
	};
};

const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';

const isEtherscanEthPriceResponse = (value: unknown): value is EtherscanEthPriceResponse =>
	typeof value === 'object' &&
	value !== null &&
	'status' in value &&
	typeof value.status === 'string' &&
	'message' in value &&
	typeof value.message === 'string' &&
	'result' in value &&
	typeof value.result === 'object' &&
	value.result !== null &&
	'ethusd' in value.result &&
	typeof value.result.ethusd === 'string';

export class ExchangeRateImportService extends BaseService {
	static readonly DAY_IN_MILLISECONDS = 60 * 60 * 24 * 1000;

	private async getAllRatesSince(date: Date): Promise<ServiceResult<ExchangeRate[]>> {
		const fromDate = new Date(date);
		fromDate.setHours(0, 0, 0, 0);
		try {
			const result = await this.db.exchangeRate.findMany({
				where: { timestamp: { gte: fromDate } },
				orderBy: { timestamp: 'asc' },
			});

			if (!result) {
				return this.resultFail('No exchange rates found');
			}

			return this.resultOk(result);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch exchange rates: ${JSON.stringify(error)}`);
		}
	}

	private async fetchExchangeRates(dt: DateTime): Promise<ExchangeRateResponse> {
		if (!process.env.EXCHANGE_RATES_API) {
			throw new Error('EXCHANGE_RATES_API environment variable is not set');
		}

		const day = dt.toFormat('yyyy-MM-dd');
		this.logger.info('Fetching exchange rates for day', { day });
		const response = await fetch(`https://api.apilayer.com/exchangerates_data/${day}?base=chf`, {
			method: 'GET',
			headers: {
				apiKey: process.env.EXCHANGE_RATES_API,
			},
		});
		if (!response.ok) {
			throw new Error(`Exchange Rate Request Failure for ${day}: ${response.status} ${response.statusText}`);
		}
		const data: ExchangeRateResponse = await response.json();

		return data;
	}

	private async storeExchangeRates(response: ExchangeRateResponse): Promise<ServiceResult<ExchangeRateCreateInput[]>> {
		const data: ExchangeRateCreateInput[] = [];
		for (const [currency, rate] of Object.entries(response.rates ?? {})) {
			if (!isValidCurrency(currency)) {
				continue;
			}
			data.push({
				currency: currency,
				rate: rate,
				timestamp: new Date(response.date + 'Z'),
			});
		}
		try {
			await this.db.exchangeRate.createMany({ data });

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not store exchange rates: ${JSON.stringify(error)}`);
		}
	}

	private async fetchAndStoreExchangeRates(dt: DateTime): Promise<ServiceResult<ExchangeRateResponse>> {
		try {
			const rates = await this.fetchExchangeRates(dt);
			const storeResult = await this.storeExchangeRates(rates);
			if (!storeResult.success) {
				return this.resultFail(storeResult.error, storeResult.status);
			}
			this.logger.info('Ingested exchange rates for date', { date: dt.toISODate() });

			return this.resultOk(rates);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not ingest exchange rates: ${JSON.stringify(error)}`);
		}
	}

	private async fetchEthUsdPrice(): Promise<number> {
		const apiKey = process.env.ETHERSCAN_API_KEY?.trim();
		if (!apiKey) {
			throw new Error('ETHERSCAN_API_KEY environment variable is not set');
		}

		const parameters = new URLSearchParams({
			module: 'stats',
			action: 'ethprice',
			chainid: '1',
			apikey: apiKey,
		});
		const response = await fetch(`${ETHERSCAN_API_URL}?${parameters.toString()}`, { method: 'GET' });
		if (!response.ok) {
			throw new Error(`Etherscan Request Failure: ${response.status} ${response.statusText}`);
		}

		const data: unknown = await response.json();
		if (!isEtherscanEthPriceResponse(data)) {
			throw new Error('Invalid Etherscan ETH price response: invalid response shape');
		}
		const ethUsdPrice = Number(data.result.ethusd);
		if (data.status !== '1' || !Number.isFinite(ethUsdPrice) || ethUsdPrice <= 0) {
			throw new Error(`Invalid Etherscan ETH price response: ${data.message}`);
		}

		return ethUsdPrice;
	}

	private async importTodayEthExchangeRate(): Promise<ServiceResult<void>> {
		try {
			const today = DateTime.utc().startOf('day');
			const tomorrow = today.plus({ days: 1 });
			const existingRates = await this.db.exchangeRate.findMany({
				where: {
					currency: { in: ['ETH', 'USD'] },
					timestamp: {
						gte: today.toJSDate(),
						lt: tomorrow.toJSDate(),
					},
				},
			});

			if (existingRates.some(({ currency }) => currency === 'ETH')) {
				this.logger.info('ETH exchange rate already exists for today');

				return this.resultOk(undefined);
			}

			let usdRate = existingRates.find(({ currency }) => currency === 'USD')?.rate.toNumber();
			if (usdRate === undefined) {
				const ratesResult = await this.fetchAndStoreExchangeRates(today);
				if (!ratesResult.success) {
					return this.resultFail(`Could not import ETH exchange rate: ${ratesResult.error}`);
				}
				usdRate = ratesResult.data.rates.USD;
			}
			if (usdRate === undefined || !Number.isFinite(usdRate) || usdRate <= 0) {
				return this.resultFail('Could not import ETH exchange rate: USD exchange rate for today is missing');
			}

			const ethUsdPrice = await this.fetchEthUsdPrice();
			const ethRate = usdRate / ethUsdPrice;
			await this.db.exchangeRate.create({
				data: {
					currency: 'ETH',
					rate: ethRate,
					timestamp: today.toJSDate(),
				},
			});
			this.logger.info('Ingested ETH exchange rate for today', {
				date: today.toISODate(),
				rate: ethRate,
			});

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not import ETH exchange rate: ${JSON.stringify(error)}`);
		}
	}

	async import(): Promise<ServiceResult<void>> {
		try {
			const oneMonthAgo = now();
			oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

			const existingExchangeRates = await this.getAllRatesSince(oneMonthAgo);

			if (!existingExchangeRates.success) {
				this.logger.error('Could not fetch existing exchange rates');

				return this.resultFail('Could not fetch existing exchange rates');
			}

			this.logger.info('Starting exchange rate import', {
				fromDate: oneMonthAgo.toISOString(),
				toDate: now().toISOString(),
			});

			for (
				let timestamp = oneMonthAgo.getTime();
				timestamp <= nowMs();
				timestamp += ExchangeRateImportService.DAY_IN_MILLISECONDS
			) {
				const ratesForTimestamp = existingExchangeRates.data.filter((rate) => {
					return (
						rate.timestamp.getUTCFullYear() === new Date(timestamp).getUTCFullYear() &&
						rate.timestamp.getUTCMonth() === new Date(timestamp).getUTCMonth() &&
						rate.timestamp.getUTCDate() === new Date(timestamp).getUTCDate()
					);
				});

				this.logger.info('Checking exchange rates for timestamp', {
					date: DateTime.fromMillis(timestamp).toISODate(),
					found: ratesForTimestamp.length,
				});

				if (!ratesForTimestamp?.length) {
					try {
						const storedRates = await this.fetchAndStoreExchangeRates(DateTime.fromMillis(timestamp));
						if (!storedRates.success) {
							this.logger.error('Could not store exchange rates');

							return this.resultFail(`Could not store exchange rates: ${storedRates.error}`);
						}
					} catch (error) {
						this.logger.error(error);

						return this.resultFail(`Could not fetch and store exchange rates: ${JSON.stringify(error)}`);
					}
				}
			}

			const ethImportResult = await this.importTodayEthExchangeRate();
			if (!ethImportResult.success) {
				this.logger.error(ethImportResult.error);
			}

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not import exchange rates: ${JSON.stringify(error)}`);
		}
	}
}
