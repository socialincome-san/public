import axios from 'axios';
import { logger } from 'firebase-functions';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { EXCHANGE_RATES_PATH, ExchangeRates, ExchangeRatesEntry } from '../../../../../shared/src/types/exchange-rates';
import { EXCHANGE_RATES_API } from '../../../config';

export type ExchangeRateResponse = {
	base: string;
	date: string;
	rates: ExchangeRates;
};

export class ExchangeRateImporter {
	static readonly secondsInDay = 60 * 60 * 24;
	static readonly startTimestamp = 1583020800; // 2020-03-01 00:00:00
	private readonly firestoreAdmin: FirestoreAdmin;

	constructor() {
		this.firestoreAdmin = new FirestoreAdmin();
	}

	getAllExchangeRates = async (): Promise<Map<number, ExchangeRates>> => {
		const exchangeRates = await this.firestoreAdmin.getAll<ExchangeRatesEntry>(EXCHANGE_RATES_PATH);
		return new Map(
			exchangeRates.map((exchangeRate) => {
				return [exchangeRate.timestamp, exchangeRate.rates]; // rounded to day
			}),
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
			{ headers: { apiKey: EXCHANGE_RATES_API } },
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

	fetchAndStoreExchangeRates = async (dt: DateTime): Promise<ExchangeRateResponse> => {
		const rates = await this.fetchExchangeRates(dt);
		await this.storeExchangeRates(rates);
		logger.info('Ingested exchange rates');
		return rates;
	};
}
