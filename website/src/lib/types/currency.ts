import { CountryCode } from './country';

// ISO 4217 currency codes
const CURRENCIES = [
	'AED', // United Arab Emirates
	'AFN', // Afghanistan
	'ALL', // Albania
	'AMD', // Armenia
	'ANG', // Netherlands Antilles
	'AOA', // Angola
	'ARS', // Argentina
	'AUD', // Australia
	'AWG', // Aruba
	'AZN', // Azerbaijan
	'BAM', // Bosnia and Herzegovina
	'BBD', // Barbados
	'BDT', // Bangladesh
	'BGN', // Bulgaria
	'BHD', // Bahrain
	'BIF', // Burundi
	'BMD', // Bermuda
	'BND', // Brunei
	'BOB', // Bolivia
	'BRL', // Brazil
	'BSD', // Bahamas
	'BTC', // Bitcoin
	'BTN', // Bhutan
	'BWP', // Botswana
	'BYN', // Belarus
	'BYR', // Belarus
	'BZD', // Belize
	'CAD', // Canada
	'CDF', // Congo
	'CHF', // Switzerland
	'CLF', // Chile
	'CLP', // Chile
	'CNY', // China
	'COP', // Colombia
	'CRC', // Costa Rica
	'CUC', // Cuba
	'CUP', // Cuba
	'CVE', // Cape Verde
	'CZK', // Czech Republic
	'DJF', // Djibouti
	'DKK', // Denmark
	'DOP', // Dominican Republic
	'DZD', // Algeria
	'EGP', // Egypt
	'ERN', // Eritrea
	'ETB', // Ethiopia
	'EUR', // Eurozone
	'FJD', // Fiji
	'FKP', // Falkland Islands
	'FOK', // Faroe Islands
	'GBP', // United Kingdom
	'GEL', // Georgia
	'GGP', // Guernsey
	'GHS', // Ghana
	'GIP', // Gibraltar
	'GMD', // Gambia
	'GNF', // Guinea
	'GTQ', // Guatemala
	'GYD', // Guyana
	'HKD', // Hong Kong
	'HNL', // Honduras
	'HRK', // Croatia
	'HTG', // Haiti
	'HUF', // Hungary
	'IDR', // Indonesia
	'ILS', // Israel
	'IMP', // Isle of Man
	'INR', // India
	'IQD', // Iraq
	'IRR', // Iran
	'ISK', // Iceland
	'JEP', // Jersey
	'JMD', // Jamaica
	'JOD', // Jordan
	'JPY', // Japan
	'KES', // Kenya
	'KGS', // Kyrgyzstan
	'KHR', // Cambodia
	'KID', // Kiribati
	'KMF', // Comoros
	'KPW', // North Korea
	'KRW', // South Korea
	'KWD', // Kuwait
	'KYD', // Cayman Islands
	'KZT', // Kazakhstan
	'LAK', // Laos
	'LBP', // Lebanon
	'LKR', // Sri Lanka
	'LRD', // Liberia
	'LSL', // Lesotho
	'LTL', // Lithuania
	'LYD', // Libya
	'LVL', // Latvia
	'MAD', // Morocco
	'MDL', // Moldova
	'MGA', // Madagascar
	'MKD', // North Macedonia
	'MMK', // Myanmar
	'MNT', // Mongolia
	'MOP', // Macau
	'MRO', // Mauritania
	'MUR', // Mauritius
	'MVR', // Maldives
	'MWK', // Malawi
	'MXN', // Mexico
	'MYR', // Malaysia
	'MZN', // Mozambique
	'NAD', // Namibia
	'NGN', // Nigeria
	'NIO', // Nicaragua
	'NOK', // Norway
	'NPR', // Nepal
	'NZD', // New Zealand
	'OMR', // Oman
	'PAB', // Panama
	'PEN', // Peru
	'PGK', // Papua New Guinea
	'PHP', // Philippines
	'PKR', // Pakistan
	'PLN', // Poland
	'PYG', // Paraguay
	'QAR', // Qatar
	'RON', // Romania
	'RSD', // Serbia
	'RUB', // Russia
	'RWF', // Rwanda
	'SAR', // Saudi Arabia
	'SBD', // Solomon Islands
	'SCR', // Seychelles
	'SDG', // Sudan
	'SEK', // Sweden
	'SGD', // Singapore
	'SHP', // Saint Helena
	'SLE', // Sierra Leone
	'SLL', // Sierra Leone
	'SOS', // Somalia
	'SRD', // Suriname
	'SSP', // South Sudan
	'STD', // Sao Tome and Principe
	'SVC', // El Salvador
	'SYP', // Syria
	'SZL', // Eswatini
	'THB', // Thailand
	'TJS', // Tajikistan
	'TMT', // Turkmenistan
	'TND', // Tunisia
	'TOP', // Tonga
	'TRY', // Turkey
	'TTD', // Trinidad and Tobago
	'TWD', // Taiwan
	'TZS', // Tanzania
	'UAH', // Ukraine
	'UGX', // Uganda
	'USD', // United States
	'UYU', // Uruguay
	'UZS', // Uzbekistan
	'VEF', // Venezuela
	'VES', // Venezuela
	'VND', // Vietnam
	'VUV', // Vanuatu
	'WST', // Samoa
	'XAF', // Central African CFA franc
	'XAU', // Gold
	'XAG', // Silver
	'XCD', // East Caribbean dollar
	'XDR', // Special Drawing Rights
	'XOF', // West African CFA franc
	'XPF', // CFP franc
	'YER', // Yemen
	'ZAR', // South Africa
	'ZMK', // Zambia
	'ZMW', // Zambia
	'ZWL', // Zimbabwe
] as const;
export type Currency = (typeof CURRENCIES)[number];

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
	if (!country) return FALLBACK_CURRENCY;
	const currency = countryToCurrency.get(country);
	return currency || FALLBACK_CURRENCY;
};

export const isValidCurrency = (currency: string | undefined): currency is Currency => {
	return CURRENCIES.includes(currency as Currency);
};
