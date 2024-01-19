import { FirestoreAdmin } from '../firebase/admin/FirestoreAdmin';
import { Currency } from '../types/currency';
import { EXCHANGE_RATES_PATH, ExchangeRatesEntry } from '../types/exchange-rates';

export const getLatestExchangeRate = async (firestoreAdmin: FirestoreAdmin, currency: Currency): Promise<number> => {
	if (currency === 'CHF') return 1.0;
	const exchangeRates = await firestoreAdmin
		.collection<ExchangeRatesEntry>(EXCHANGE_RATES_PATH)
		.orderBy('timestamp', 'desc')
		.limit(1)
		.get();
	return exchangeRates.docs.at(0)?.data().rates[currency] || 1.0;
};
