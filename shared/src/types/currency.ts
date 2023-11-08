export const CURRENCIES = ['CHF', 'EUR', 'USD', 'SLE'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const FALLBACK_CURRENCY: Currency = 'USD';
const countryToCurrency = new Map<string, Currency>([
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

export const bestGuessCurrency = (country: string | undefined): Currency => {
	// best guess mapping from two-letter country code to supported currency
	if (!country) return FALLBACK_CURRENCY;
	const uppercaseCountry = country.toUpperCase();
	const currency = countryToCurrency.get(uppercaseCountry);
	return currency || FALLBACK_CURRENCY;
};

export const isValidCurrency = (currency: string | undefined): currency is Currency => {
	return CURRENCIES.includes(currency as Currency);
};
