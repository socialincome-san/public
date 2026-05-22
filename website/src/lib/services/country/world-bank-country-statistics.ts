import { type CountryCode } from '@/generated/prisma/enums';

const COUNTRY_STATISTIC_DEFINITIONS = [
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

const WORLD_BANK_RECENT_VALUE_COUNT = 10;
const WORLD_BANK_REVALIDATE_SECONDS = 60 * 60 * 24;

type CountryStatisticDefinition = (typeof COUNTRY_STATISTIC_DEFINITIONS)[number];
type WorldBankIndicatorEntry = {
	value?: number | string | null;
};

type CountryStatisticKey = CountryStatisticDefinition['key'];
export type CountryStatisticFormat = CountryStatisticDefinition['format'];
type CountryStatisticRow = {
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

const isWorldBankIndicatorEntry = (entry: unknown): entry is WorldBankIndicatorEntry => {
	return typeof entry === 'object' && entry !== null && 'value' in entry;
};

const hasWorldBankIndicatorValue = (entry: unknown): entry is WorldBankIndicatorEntry => {
	return isWorldBankIndicatorEntry(entry) && entry.value !== null && entry.value !== undefined;
};

const isArray = (value: unknown): value is unknown[] => {
	return Array.isArray(value);
};

const extractLatestWorldBankValue = (payload: unknown): number | null => {
	if (!isArray(payload)) {
		return null;
	}

	const entries = payload[1];
	if (!isArray(entries)) {
		return null;
	}

	const latestEntry = entries.find(hasWorldBankIndicatorValue);
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

const buildCountryStatisticRows = (
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

const fetchWorldBankIndicator = async (
	countryCode: CountryCode,
	indicator: CountryStatisticDefinition['indicator'],
): Promise<number | null> => {
	try {
		const query = new URLSearchParams({
			format: 'json',
			mrv: WORLD_BANK_RECENT_VALUE_COUNT.toString(),
			per_page: WORLD_BANK_RECENT_VALUE_COUNT.toString(),
		});
		const response = await fetch(`${WORLD_BANK_BASE_URL}/${countryCode}/indicator/${indicator}?${query}`, {
			next: { revalidate: WORLD_BANK_REVALIDATE_SECONDS },
		});

		if (!response.ok) {
			return null;
		}

		const payload: unknown = await response.json();

		return extractLatestWorldBankValue(payload);
	} catch {
		return null;
	}
};

const loadCountryStatisticValues = async (countryCode: CountryCode): Promise<CountryStatisticValueMap> => {
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
