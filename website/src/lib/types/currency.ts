import { CountryCode, Currency as CurrencyValues } from '../../generated/prisma/enums';
import type { Currency } from '../../generated/prisma/enums';

export type { Currency };

const CURRENCIES = Object.values(CurrencyValues) as Currency[];
export const allCurrencies = CURRENCIES;

const FALLBACK_CURRENCY: Currency = 'USD';
const countryToCurrency = new Map<CountryCode, Currency>([
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
	['PL', 'EUR'],
	['PT', 'EUR'],
	['US', 'USD'],
]);

export const bestGuessCurrency = (country: CountryCode | undefined): Currency => {
	// best guess mapping from two-letter country code to a supported currency
	if (!country) {
		return FALLBACK_CURRENCY;
	}
	const currency = countryToCurrency.get(country);
	return currency || FALLBACK_CURRENCY;
};

export const isValidCurrency = (currency: string | undefined): currency is Currency => {
	return CURRENCIES.includes(currency as Currency);
};
