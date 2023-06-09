import { ExchangeRates, ExchangeRatesEntry, EXCHANGE_RATES_PATH } from '@socialincome/shared/src/types';
import axios from 'axios';
import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';
import { EXCHANGE_RATES_API } from '../config';
import { AbstractFirebaseAdmin, FunctionProvider } from '../firebase';

export type ExchangeRateResponse = {
	base: string;
	date: string;
	rates: ExchangeRates;
};

export class ExchangeRateImporter extends AbstractFirebaseAdmin implements FunctionProvider {
	static readonly secondsInDay = 60 * 60 * 24;
	static readonly startTimestamp = 1583020800; // 2020-03-01 00:00:00

	/**
	 * Function periodically scrapes currency exchange rates and saves them to firebase
	 */
	getFunction() {
		return functions
			.runWith({
				timeoutSeconds: 540,
			})
			.pubsub.schedule('0 1 * * *')
			.onRun(async () => {
				const existingExchangeRates = await this.getAllExchangeRates();
				for (
					let timestamp = ExchangeRateImporter.startTimestamp;
					timestamp <= Date.now() / 1000;
					timestamp += ExchangeRateImporter.secondsInDay
				) {
					if (!existingExchangeRates.has(timestamp)) {
						try {
							await this.fetchAndStoreExchangeRates(DateTime.fromSeconds(timestamp));
						} catch (error) {
							functions.logger.error(`Could not ingest exchange rate`, error);
						}
					}
				}
			});
	}

	getAllExchangeRates = async (): Promise<Map<number, ExchangeRates>> => {
		const exchangeRates = await this.firestoreAdmin.getAll<ExchangeRatesEntry>(EXCHANGE_RATES_PATH);
		return new Map(
			exchangeRates.map((exchangeRate) => {
				return [exchangeRate.timestamp, exchangeRate.rates]; // rounded to day
			})
		);
	};

	getExchangeRates = async (dt: DateTime): Promise<ExchangeRates> => {
		const exchangeRateDoc = await this.firestoreAdmin
			.doc<ExchangeRatesEntry>(EXCHANGE_RATES_PATH, dt.toSeconds().toString())
			.get();
		if (exchangeRateDoc?.exists) {
			return exchangeRateDoc.get('rates');
		} else {
			const exchangeRateResponse = await this.fetchAndStoreExchangeRates(dt);
			return exchangeRateResponse.rates;
		}
	};

	fetchExchangeRates = async (dt: DateTime): Promise<ExchangeRateResponse> => {
		const day = dt.toFormat('yyyy-MM-dd');
		const { data, status, statusText } = await axios.get<ExchangeRateResponse>(
			`https://api.apilayer.com/exchangerates_data/${day}?base=chf`,
			{ headers: { apiKey: EXCHANGE_RATES_API } }
		);
		if (status !== 200) {
			throw new Error(`Exchange Rate Request Failure for ${day}: ${statusText}`);
		}
		return data;
	};

	storeExchangeRates = async (response: ExchangeRateResponse): Promise<void> => {
		const exchangeRates: ExchangeRatesEntry = {
			base: response.base,
			timestamp: Date.parse(response.date + 'Z') / 1000,
			rates: response.rates,
		};
		await this.firestoreAdmin
			.doc<ExchangeRatesEntry>(EXCHANGE_RATES_PATH, exchangeRates.timestamp.toString())
			.set(exchangeRates);
	};

	private fetchAndStoreExchangeRates = async (dt: DateTime): Promise<ExchangeRateResponse> => {
		const rates = await this.fetchExchangeRates(dt);
		await this.storeExchangeRates(rates);
		functions.logger.info('Ingested exchange rates');
		return rates;
	};
}
