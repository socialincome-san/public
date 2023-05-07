// support languages in website / precomputed stats
import { FirestoreAdmin } from '../firebase/FirestoreAdmin';
import { ExchangeRatesEntry, EXCHANGE_RATES_PATH } from '../types';

export const displayedCurrencies = ['CHF', 'USD', 'EUR'];

// best guess mapping from two-letter country code to supported currency
export const bestGuessCurrency = (country: string | undefined): string => {
	if (!country) return fallbackCurrency;
	const uppercaseCountry = country.toUpperCase();
	const currency = countryToCurrency.get(uppercaseCountry);
	return currency || fallbackCurrency;
};

const fallbackCurrency = 'USD';
const countryToCurrency = new Map<string, string>([
	['AD', 'EUR'],
	['AL', 'EUR'],
	['AM', 'EUR'],
	['AT', 'EUR'],
	['BA', 'EUR'],
	['BE', 'EUR'],
	['BG', 'EUR'],
	['BY', 'EUR'],
	['CH', 'CHF'],
	['CY', 'EUR'],
	['CZ', 'EUR'],
	['DE', 'EUR'],
	['DK', 'EUR'],
	['EE', 'EUR'],
	['ES', 'EUR'],
	['FI', 'EUR'],
	['FO', 'EUR'],
	['FR', 'EUR'],
	['GB', 'EUR'],
	['GE', 'EUR'],
	['GI', 'EUR'],
	['GR', 'EUR'],
	['HR', 'EUR'],
	['HU', 'EUR'],
	['IE', 'EUR'],
	['IS', 'EUR'],
	['IT', 'EUR'],
	['LT', 'EUR'],
	['LU', 'EUR'],
	['LV', 'EUR'],
	['MC', 'EUR'],
	['MK', 'EUR'],
	['MT', 'EUR'],
	['NL', 'EUR'],
	['NO', 'EUR'],
	['PO', 'EUR'],
	['PT', 'EUR'],
]);

export const getLatestExchangeRate = async (firestoreAdmin: FirestoreAdmin, currency: string): Promise<number> => {
	if (currency === 'CHF') return 1.0;
	const exchangeRates = await firestoreAdmin
		.collection<ExchangeRatesEntry>(EXCHANGE_RATES_PATH)
		.orderBy('timestamp', 'desc')
		.limit(1)
		.get();
	return exchangeRates.docs.at(0)?.data().rates[currency] || 1.0;
};
