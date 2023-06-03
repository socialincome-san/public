import { FirestoreAdmin } from '../firebase/FirestoreAdmin';
import { ExchangeRatesEntry, EXCHANGE_RATES_PATH } from '../types';

export const getLatestExchangeRate = async (firestoreAdmin: FirestoreAdmin, currency: string): Promise<number> => {
	if (currency === 'CHF') return 1.0;
	const exchangeRates = await firestoreAdmin
		.collection<ExchangeRatesEntry>(EXCHANGE_RATES_PATH)
		.orderBy('timestamp', 'desc')
		.limit(1)
		.get();
	return exchangeRates.docs.at(0)?.data().rates[currency] || 1.0;
};
