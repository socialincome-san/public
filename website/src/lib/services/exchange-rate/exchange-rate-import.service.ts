import { ExchangeRate, PrismaClient } from '@/generated/prisma/client';
import { now, nowMs } from '@/lib/utils/now';
import { DateTime } from 'luxon';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateCreateInput, ExchangeRates } from './exchange-rate.types';
type ExchangeRateResponse = {
	base: string;
	date: string;
	rates: ExchangeRates;
};

export class ExchangeRateImportService extends BaseService {
	constructor(db: PrismaClient) { super(db); }

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
		const data = await response.json();
		return data;
	}

	private async storeExchangeRates(response: ExchangeRateResponse): Promise<ServiceResult<ExchangeRateCreateInput[]>> {
		const data: ExchangeRateCreateInput[] = [];
		for (const [currency, rate] of Object.entries(response.rates ?? {})) {
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

	async import(): Promise<ServiceResult<void>> {
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
		return this.resultOk(undefined);
	}
}
