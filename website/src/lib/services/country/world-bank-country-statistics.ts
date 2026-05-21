import { type CountryCode } from '@/generated/prisma/enums';

export const COUNTRY_STATISTIC_DEFINITIONS = [
	{
		key: 'population',
		indicator: 'SP.POP.TOTL',
		labelKey: 'countries-page.statistics.population',
		format: 'number',
	},
	{
		key: 'growthRate',
		indicator: 'SP.POP.GROW',
		labelKey: 'countries-page.statistics.growth-rate',
		format: 'percentage',
	},
	{
		key: 'literacyRate',
		indicator: 'SE.ADT.LITR.ZS',
		labelKey: 'countries-page.statistics.literacy-rate',
		format: 'percentage',
	},
	{
		key: 'povertyLevel',
		indicator: 'SI.POV.DDAY',
		labelKey: 'countries-page.statistics.poverty-level',
		format: 'percentage',
	},
	{
		key: 'lifeExpectancy',
		indicator: 'SP.DYN.LE00.IN',
		labelKey: 'countries-page.statistics.life-expectancy',
		format: 'years',
	},
] as const;

const WORLD_BANK_REVALIDATE_SECONDS = 60 * 60 * 24;

type CountryStatisticDefinition = (typeof COUNTRY_STATISTIC_DEFINITIONS)[number];
type WorldBankIndicatorResponse = [
	unknown,
	{
		value?: number | string | null;
	}[]?,
];

export type CountryStatisticKey = CountryStatisticDefinition['key'];
export type CountryStatisticFormat = CountryStatisticDefinition['format'];
export type CountryStatisticRow = {
	key: CountryStatisticKey;
	labelKey: CountryStatisticDefinition['labelKey'];
	format: CountryStatisticFormat;
	countryValue: number;
	visitorValue: number;
};

type CountryStatisticValueMap = Record<CountryStatisticKey, number | null>;

const WORLD_BANK_BASE_URL = 'https://api.worldbank.org/v2/country';
const EMPTY_COUNTRY_STATISTIC_VALUE_MAP: CountryStatisticValueMap = {
	population: null,
	growthRate: null,
	literacyRate: null,
	povertyLevel: null,
	lifeExpectancy: null,
};

export const extractLatestWorldBankValue = (payload: unknown): number | null => {
	if (!Array.isArray(payload) || payload.length < 2) {
		return null;
	}

	const [, entries] = payload as WorldBankIndicatorResponse;
	const latestEntry = entries?.find((entry) => entry?.value !== null && entry?.value !== undefined);
	const { value } = latestEntry ?? {};

	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string') {
		const parsedValue = Number(value);

		return Number.isFinite(parsedValue) ? parsedValue : null;
	}

	return null;
};

export const buildCountryStatisticRows = (
	countryValues: CountryStatisticValueMap,
	visitorValues: CountryStatisticValueMap,
): CountryStatisticRow[] => {
	return COUNTRY_STATISTIC_DEFINITIONS.flatMap((definition) => {
		const countryValue = countryValues[definition.key];
		const visitorValue = visitorValues[definition.key];

		if (countryValue === null || visitorValue === null) {
			return [];
		}

		return [
			{
				key: definition.key,
				labelKey: definition.labelKey,
				format: definition.format,
				countryValue,
				visitorValue,
			},
		];
	});
};

export const fetchWorldBankIndicator = async (
	countryCode: CountryCode,
	indicator: CountryStatisticDefinition['indicator'],
): Promise<number | null> => {
	try {
		const response = await fetch(`${WORLD_BANK_BASE_URL}/${countryCode}/indicator/${indicator}?format=json&mrv=1`, {
			next: { revalidate: WORLD_BANK_REVALIDATE_SECONDS },
		});

		if (!response.ok) {
			return null;
		}

		return extractLatestWorldBankValue((await response.json()) as unknown);
	} catch {
		return null;
	}
};

export const loadCountryStatisticValues = async (countryCode: CountryCode): Promise<CountryStatisticValueMap> => {
	const indicatorResults = await Promise.all(
		COUNTRY_STATISTIC_DEFINITIONS.map(async (definition) => ({
			key: definition.key,
			value: await fetchWorldBankIndicator(countryCode, definition.indicator),
		})),
	);

	return indicatorResults.reduce<CountryStatisticValueMap>(
		(accumulator, result) => ({
			...accumulator,
			[result.key]: result.value,
		}),
		EMPTY_COUNTRY_STATISTIC_VALUE_MAP,
	);
};

export const loadCountryStatisticsComparison = async (
	countryCode: CountryCode,
	visitorCountryCode: CountryCode,
): Promise<CountryStatisticRow[]> => {
	const [countryValues, visitorValues] = await Promise.all([
		loadCountryStatisticValues(countryCode),
		loadCountryStatisticValues(visitorCountryCode),
	]);

	return buildCountryStatisticRows(countryValues, visitorValues);
};
