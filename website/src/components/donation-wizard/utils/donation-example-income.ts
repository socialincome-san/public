import type { CountryCode } from '@/generated/prisma/enums';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { toCountryCode } from '@/lib/types/country';

const monthlyIncomeChf: Partial<Record<CountryCode, number>> = {
	AL: 732,
	AD: 2449,
	AM: 644,
	AT: 4522,
	AZ: 523,
	BA: 1041,
	BY: 616,
	BE: 4691,
	BG: 1132,
	CH: 8071,
	CY: 2368,
	CZ: 1800,
	DE: 3990,
	DK: 5602,
	EE: 1887,
	ES: 2623,
	FI: 3891,
	FR: 3565,
	GB: 4201,
	GE: 666,
	GR: 1467,
	HR: 1735,
	HU: 1361,
	IE: 4413,
	IS: 6278,
	IT: 2631,
	KZ: 761,
	LI: 7401,
	LT: 2283,
	LU: 6636,
	LV: 1605,
	MD: 689,
	ME: 1032,
	MK: 959,
	MT: 1864,
	NL: 4624,
	NO: 4911,
	PL: 1689,
	PT: 1840,
	RO: 1629,
	RS: 1101,
	SE: 3678,
	SI: 2947,
	SK: 1618,
	TR: 1224,
	UA: 471,
};

const chfToCurrency: Record<WebsiteCurrency, number> = {
	CHF: 1,
	EUR: 1.0496,
	USD: 1.1361,
};

const roundToFriendlyIncome = (amount: number): number => {
	const step = amount >= 5000 ? 1000 : amount >= 2000 ? 500 : 100;

	return Math.round(amount / step) * step;
};

export const getExampleIncome = (country: string | null, currency: WebsiteCurrency): number | null => {
	const countryCode = toCountryCode(country);
	const income = countryCode ? monthlyIncomeChf[countryCode] : undefined;
	if (income === undefined) {
		return null;
	}

	const friendlyIncome = roundToFriendlyIncome(income);

	return currency === 'CHF' ? friendlyIncome : Math.round((friendlyIncome * chfToCurrency[currency]) / 10) * 10;
};
