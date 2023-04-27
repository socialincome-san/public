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

export type ExchangeRateResponse = {
	base: string;
	date: string;
	rates: ExchangeRates;
};

export class ExchangeRateImporter {
	readonly secondsInDay = 60 * 60 * 24;
	readonly startTimestamp = 1583020800; // 2020-03-01 00:00:00
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}
	/**
	 * Function periodically scrapes currency exchange rates and saves them to firebase
	 */
	importExchangeRates = functions.pubsub.schedule('0 1 * * *').onRun(async () => {
		try {
			const { data, status, statusText } = await axios.get<ExchangeRateResponse>(
				'https://api.exchangerate.host/latest?base=chf'
			);
			if (status === 200) {
				await this.storeExchangeRates(data);
				functions.logger.info('Ingested exchange rates');
			} else {
				functions.logger.error('Could not ingest exchange rate', statusText);
			}
		} catch (error) {
			functions.logger.error('Could not ingest exchange rate', error);
		}
	});

	/**
	 * One-off function to import all exchange rates on a daily granularity since the project start.
	 * The cronjob is taking care of periodically ingesting the data.
	 */
	importMissingExchangeRates = functions
		.runWith({
			timeoutSeconds: 540,
			memory: '2GB',
		})
		.https.onCall(async (_, { auth }) => {
			await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

			const exchangeRates = await this.firestoreAdmin.getAll<ExchangeRatesEntry>(EXCHANGE_RATES_PATH);
			const existingDays = new Set(
				exchangeRates.map((exchangeRate) => {
					return Math.floor(exchangeRate.timestamp / this.secondsInDay) * this.secondsInDay; // rounded to day
				})
			);

			for (let timestamp = this.startTimestamp; timestamp <= Date.now() / 1000; timestamp += this.secondsInDay) {
				if (!existingDays.has(timestamp)) {
					const day = DateTime.fromSeconds(timestamp).toFormat('yyyy-MM-dd');
					try {
						const { data, status, statusText } = await axios.get<ExchangeRateResponse>(
							`https://api.apilayer.com/exchangerates_data/${day}?base=chf`,
							{ headers: { apiKey: 'zdVXSn1iYAmME5xTmmIXHJm9NhCaaSck' } }
						);
						if (status === 200) {
							await this.storeExchangeRates(data);
							functions.logger.info(`Ingested exchange rates for ${day}`);
						} else {
							functions.logger.error(`Could not ingest exchange rate for ${day}`, statusText);
						}
					} catch (error) {
						functions.logger.error(`Could not ingest exchange rate for ${day}`, error);
					}
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
}
