import axios from 'axios';
import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import {
	ExchangeRates,
	ExchangeRatesEntry,
	EXCHANGE_RATES_PATH,
	getIdFromExchangeRates,
} from '../../../shared/src/types';
import { EXCHANGE_RATES_API } from '../config';

export type ExchangeRateResponse = {
	base: string;
	date: string;
	rates: ExchangeRates;
};

export class ExchangeRateImporter {
	static readonly secondsInDay = 60 * 60 * 24;
	static readonly startTimestamp = 1583020800; // 2020-03-01 00:00:00
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}
	/**
	 * Function periodically scrapes currency exchange rates and saves them to firebase
	 */
	importExchangeRates = functions
		.runWith({
			timeoutSeconds: 540,
		})
		.pubsub.schedule('0 1 * * *')
		.onRun(async () => {
			const existingExchangeRates = await this.getDailyExchangeRates();
			for (
				let timestamp = ExchangeRateImporter.startTimestamp;
				timestamp <= Date.now() / 1000;
				timestamp += ExchangeRateImporter.secondsInDay
			) {
				if (!existingExchangeRates.has(timestamp)) {
					await this.getAndStoreExchangeRate(DateTime.fromSeconds(timestamp));
				}
			}
		});

	storeExchangeRates = async (response: ExchangeRateResponse): Promise<void> => {
		const exchangeRates: ExchangeRatesEntry = {
			base: response.base,
			timestamp: Date.parse(response.date + 'Z') / 1000,
			rates: response.rates,
		};
		await this.firestoreAdmin
			.doc<ExchangeRatesEntry>(EXCHANGE_RATES_PATH, getIdFromExchangeRates(exchangeRates))
			.set(exchangeRates);
	};

	getExchangeRate = async (dt: DateTime): Promise<ExchangeRateResponse> => {
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

	getAndStoreExchangeRate = async (dt: DateTime): Promise<void> => {
		try {
			const rates = await this.getExchangeRate(dt);
			await this.storeExchangeRates(rates);
			functions.logger.info('Ingested exchange rates');
		} catch (error) {
			functions.logger.error(`Could not ingest exchange rate`, error);
		}
	};

	getDailyExchangeRates = async (): Promise<Map<number, ExchangeRates>> => {
		const exchangeRates = await this.firestoreAdmin.getAll<ExchangeRatesEntry>(EXCHANGE_RATES_PATH);
		return new Map(
			exchangeRates.map((exchangeRate) => {
				return [ExchangeRateImporter.toDailyBuckets(exchangeRate.timestamp), exchangeRate.rates]; // rounded to day
			})
		);
	};

	static toDailyBuckets = (ts: number): number => {
		return Math.floor(ts / this.secondsInDay) * this.secondsInDay;
	};
}
