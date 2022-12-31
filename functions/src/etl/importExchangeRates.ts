import axios from 'axios';
import * as functions from 'firebase-functions';
import { doc } from '../../../shared/src/firebase/firestoreAdmin';
import {
	ExchangeRates,
	ExchangeRatesEntry,
	EXCHANGE_RATES_PATH,
	getIdFromExchangeRates,
} from '../../../shared/src/types';

/**
 * Function periodically gets the exchange rates and saves it to firebase
 */
module.exports.exchangeRates = functions.pubsub.schedule('0 1 * * *').onRun(async () => {
	try {
		const { data, status, statusText } = await axios.get<ExchangeRateResponse>(
			'https://api.exchangerate.host/latest?base=chf'
		);
		if (status === 200) {
			await storeExchangeRates(data);
			functions.logger.info('Ingested exchange rates');
		} else {
			functions.logger.error('Could not ingest exchange rate', statusText);
		}
	} catch (error) {
		functions.logger.error('Could not ingest exchange rate', error);
	}
});

export type ExchangeRateResponse = {
	base: string;
	date: string;
	rates: ExchangeRates;
};

export const storeExchangeRates = async (response: ExchangeRateResponse): Promise<void> => {
	const exchangeRates: ExchangeRatesEntry = {
		base: response.base,
		timestamp: Date.parse(response.date + 'Z') / 1000,
		rates: response.rates,
	};
	await doc<ExchangeRatesEntry>(EXCHANGE_RATES_PATH, getIdFromExchangeRates(exchangeRates)).set(exchangeRates);
};
