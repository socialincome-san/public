import type { CountryCode } from '@/generated/prisma/enums';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { COUNTRY_OPTIONS } from '@/lib/types/country';

export type DonationExampleCountryCode = CountryCode | 'XK';
type WageMetric = 'mean' | 'median';
type CurrencyConversionYear = 2023 | 2024;

export type DonationExampleIncome = {
	monthlyIncome: number;
	countryCode: DonationExampleCountryCode;
	metric: WageMetric;
	wageYear: number;
	sourceName: string;
	sourceUrl: string;
	conversionYear: CurrencyConversionYear;
};

type WageReference = {
	monthlyIncomeChf: number;
	metric: WageMetric;
	wageYear: number;
	sourceUrl: string;
	conversionYear?: CurrencyConversionYear;
};

const UNECE_WAGES_SOURCE = 'https://w3.unece.org/PXWeb2015/pxweb/en/STAT/STAT__20-ME__3-MELF/60_en_MECCWagesY_r.px/';
const KOSOVO_WAGES_SOURCE =
	'https://askdata.rks-gov.net/pxweb/en/ASKdata/ASKdata__Labour%20market__Niveli%20i%20Pagave/tab01.px/';
const LIECHTENSTEIN_WAGES_SOURCE = 'https://www.llv.li/de/news/themen-%3C%3Cloehne%3E%3E-aktualisiert-1';

const wageReferences: Partial<Record<CountryCode | 'XK', WageReference>> = {
	AL: { monthlyIncomeChf: 732, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	AD: { monthlyIncomeChf: 2449, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	BE: { monthlyIncomeChf: 4691, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	BA: { monthlyIncomeChf: 1041, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	BG: { monthlyIncomeChf: 1132, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	DK: { monthlyIncomeChf: 5602, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	DE: { monthlyIncomeChf: 3990, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	EE: { monthlyIncomeChf: 1887, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	FI: { monthlyIncomeChf: 3891, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	FR: { monthlyIncomeChf: 3565, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	GR: { monthlyIncomeChf: 1467, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	IE: { monthlyIncomeChf: 4413, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	IS: { monthlyIncomeChf: 6278, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	IT: { monthlyIncomeChf: 2631, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	XK: { monthlyIncomeChf: 609, metric: 'mean', wageYear: 2024, sourceUrl: KOSOVO_WAGES_SOURCE },
	HR: { monthlyIncomeChf: 1735, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	LV: { monthlyIncomeChf: 1605, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	LT: { monthlyIncomeChf: 2283, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	LU: { monthlyIncomeChf: 6636, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	MT: { monthlyIncomeChf: 1864, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	MD: { monthlyIncomeChf: 689, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	ME: { monthlyIncomeChf: 1032, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	NL: { monthlyIncomeChf: 4624, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	MK: { monthlyIncomeChf: 959, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	NO: { monthlyIncomeChf: 4911, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	AT: { monthlyIncomeChf: 4522, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	PL: { monthlyIncomeChf: 1689, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	PT: { monthlyIncomeChf: 1840, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	RO: { monthlyIncomeChf: 1629, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	SE: { monthlyIncomeChf: 3678, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	CH: { monthlyIncomeChf: 8071, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	RS: { monthlyIncomeChf: 1101, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	SK: { monthlyIncomeChf: 1618, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	SI: { monthlyIncomeChf: 2947, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	ES: { monthlyIncomeChf: 2623, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	CZ: { monthlyIncomeChf: 1800, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	UA: { monthlyIncomeChf: 471, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	HU: { monthlyIncomeChf: 1361, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	GB: { monthlyIncomeChf: 4201, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	BY: { monthlyIncomeChf: 616, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	CY: { monthlyIncomeChf: 2368, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	AM: { monthlyIncomeChf: 644, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	AZ: { monthlyIncomeChf: 523, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	GE: { monthlyIncomeChf: 666, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	KZ: { monthlyIncomeChf: 761, metric: 'mean', wageYear: 2024, sourceUrl: UNECE_WAGES_SOURCE },
	TR: {
		monthlyIncomeChf: 1224,
		metric: 'mean',
		wageYear: 2023,
		sourceUrl: UNECE_WAGES_SOURCE,
		conversionYear: 2023,
	},
	LI: { monthlyIncomeChf: 7401, metric: 'median', wageYear: 2024, sourceUrl: LIECHTENSTEIN_WAGES_SOURCE },
};

export const CURRENCY_CONVERSION_SOURCE =
	'https://www.bundesbank.de/resource/blob/810490/8a62b6292f45ea0e509c2c5ef6d5ac88/472B63F073F071307366337C94F8C870/wk1e1011-data.pdf';
const CURRENCY_CONVERSION_YEAR: CurrencyConversionYear = 2024;

const CHF_TO_CURRENCY_BY_YEAR: Record<CurrencyConversionYear, Record<WebsiteCurrency, number>> = {
	2023: { CHF: 1, EUR: 1.0294, USD: 1.1127 },
	2024: { CHF: 1, EUR: 1.0496, USD: 1.1361 },
};

export const convertDonationIncomeCurrency = (amount: number, from: WebsiteCurrency, to: WebsiteCurrency): number => {
	const rates = CHF_TO_CURRENCY_BY_YEAR[CURRENCY_CONVERSION_YEAR];

	return Math.round(((amount / rates[from]) * rates[to] + Number.EPSILON) * 100) / 100;
};

const roundToFriendlyIncome = (amount: number): number => {
	const step = amount >= 5000 ? 1000 : amount >= 2000 ? 500 : 100;

	return Math.round(amount / step) * step;
};

export const isDonationExampleCountryCode = (countryCode: string): countryCode is DonationExampleCountryCode =>
	countryCode === 'XK' || COUNTRY_OPTIONS.some(({ code }) => code === countryCode);

export const getDonationExampleCountryCodes = (): DonationExampleCountryCode[] =>
	Object.keys(wageReferences).filter(isDonationExampleCountryCode);

export const getDonationExampleIncome = (
	countryCode: string | null,
	currency: WebsiteCurrency,
): DonationExampleIncome | null => {
	if (!countryCode || !isDonationExampleCountryCode(countryCode)) {
		return null;
	}

	const reference = wageReferences[countryCode];
	if (!reference) {
		return null;
	}

	const friendlyChfIncome = roundToFriendlyIncome(reference.monthlyIncomeChf);
	const conversionYear: CurrencyConversionYear = reference.conversionYear ?? CURRENCY_CONVERSION_YEAR;
	const rates = CHF_TO_CURRENCY_BY_YEAR[conversionYear];
	const monthlyIncome = currency === 'CHF' ? friendlyChfIncome : Math.round((friendlyChfIncome * rates[currency]) / 10) * 10;

	return {
		countryCode,
		monthlyIncome,
		metric: reference.metric,
		wageYear: reference.wageYear,
		sourceName:
			countryCode === 'XK'
				? 'Kosovo Agency of Statistics'
				: countryCode === 'LI'
					? 'Liechtenstein Office of Statistics'
					: 'UNECE',
		sourceUrl: reference.sourceUrl,
		conversionYear,
	};
};

export const getDonationCountryOptions = () =>
	[...COUNTRY_OPTIONS, { code: 'XK' as const, name: 'Kosovo' }].sort((first, second) =>
		first.name.localeCompare(second.name),
	);
