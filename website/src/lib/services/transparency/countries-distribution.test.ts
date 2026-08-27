import { getCountryFlagColors } from '@/lib/utils/country-flag-colors';
import {
	allocateUnitCounts,
	buildTransparencyCountriesData,
	COUNTRY_DISTRIBUTION_UNIT_COUNT,
	formatPercentageDisplay,
	OTHER_SEGMENT_COLOR,
	splitTranslationTemplate,
} from './countries-distribution';
import { OTHER_COUNTRY_SEGMENT_CODE, type CountryContributionRow } from './transparency.types';

const names: Record<string, string> = {
	CH: 'Switzerland',
	DE: 'Germany',
	US: 'United States',
	FR: 'France',
	IT: 'Italy',
};

const getCountryName = (countryCode: string): string => names[countryCode] ?? '';

const row = (
	countryCode: CountryContributionRow['countryCode'],
	totalChf: number,
	contributorCount = 1,
): CountryContributionRow => ({
	countryCode,
	totalChf,
	contributorCount,
});

describe('splitTranslationTemplate', () => {
	test('keeps placeholders so translations can change word order', () => {
		expect(splitTranslationTemplate('{{amount}} donations arrived from {{countriesCount}} countries')).toEqual([
			{ type: 'placeholder', key: 'amount' },
			{ type: 'text', value: ' donations arrived from ' },
			{ type: 'placeholder', key: 'countriesCount' },
			{ type: 'text', value: ' countries' },
		]);
		expect(splitTranslationTemplate('{{countriesCount}} Länder spendeten {{amount}}')).toEqual([
			{ type: 'placeholder', key: 'countriesCount' },
			{ type: 'text', value: ' Länder spendeten ' },
			{ type: 'placeholder', key: 'amount' },
		]);
	});
});

describe('allocateUnitCounts', () => {
	test('allocates exactly 100 units with a deterministic largest remainder', () => {
		expect(allocateUnitCounts([1, 1, 1])).toEqual([34, 33, 33]);
		expect(allocateUnitCounts([1, 1, 1]).reduce((sum, count) => sum + count, 0)).toBe(COUNTRY_DISTRIBUTION_UNIT_COUNT);
		expect(allocateUnitCounts([50.6, 49.4])).toEqual([51, 49]);
	});

	test('gives a single country all units', () => {
		expect(allocateUnitCounts([250])).toEqual([100]);
	});

	test('returns zeros for empty or zero-value datasets', () => {
		expect(allocateUnitCounts([])).toEqual([]);
		expect(allocateUnitCounts([0, 0])).toEqual([0, 0]);
	});
});

describe('formatPercentageDisplay', () => {
	test('shows <1% when a positive amount rounds to zero percent', () => {
		expect(formatPercentageDisplay(0.4, 12)).toBe('<1%');
		expect(formatPercentageDisplay(0, 0)).toBe('0%');
		expect(formatPercentageDisplay(12.6, 100)).toBe('13%');
	});
});

describe('buildTransparencyCountriesData', () => {
	test('aggregates remaining countries into Other and sorts them by amount descending', () => {
		const data = buildTransparencyCountriesData([row('CH', 80), row('DE', 10), row('US', 5), row('FR', 4), row('IT', 1)], {
			limit: 2,
			getCountryName,
			getCountryColors: getCountryFlagColors,
		});

		expect(data.totalContributionsChf).toBe(100);
		expect(data.countriesCount).toBe(5);
		expect(data.segments.map((segment) => segment.countryCode)).toEqual(['CH', 'DE', OTHER_COUNTRY_SEGMENT_CODE]);
		expect(data.segments[0]?.color).toBe('#D80027');
		expect(data.segments[1]?.color).toBe('#FFDA44');
		expect(data.segments.at(-1)?.color).toBe(OTHER_SEGMENT_COLOR);
		expect(data.segments.reduce((sum, segment) => sum + segment.unitCount, 0)).toBe(100);
		expect(data.otherCountries.map((country) => country.countryCode)).toEqual(['US', 'FR', 'IT']);
		expect(data.otherCountries[0]?.totalChf).toBe(5);
	});

	test('omits Other when every country fits in the top limit', () => {
		const data = buildTransparencyCountriesData([row('CH', 70), row('DE', 30)], {
			limit: 5,
			getCountryName,
		});

		expect(data.segments).toHaveLength(2);
		expect(data.otherCountries).toEqual([]);
		expect(data.segments.every((segment) => segment.countryCode !== OTHER_COUNTRY_SEGMENT_CODE)).toBe(true);
		expect(data.segments.reduce((sum, segment) => sum + segment.unitCount, 0)).toBe(100);
	});

	test('handles a single country', () => {
		const data = buildTransparencyCountriesData([row('CH', 42)], { limit: 15, getCountryName });

		expect(data.countriesCount).toBe(1);
		expect(data.segments).toEqual([
			expect.objectContaining({
				countryCode: 'CH',
				countryName: 'Switzerland',
				totalChf: 42,
				percentageOfTotal: 100,
				unitCount: 100,
			}),
		]);
		expect(data.otherCountries).toEqual([]);
	});

	test('returns an empty model for missing or zero-value data', () => {
		expect(buildTransparencyCountriesData([], { getCountryName })).toEqual({
			totalContributionsChf: 0,
			countriesCount: 0,
			segments: [],
			otherCountries: [],
		});
		expect(buildTransparencyCountriesData([row('CH', 0)], { getCountryName }).segments).toEqual([]);
	});

	test('falls back to the country code when a name is missing', () => {
		const data = buildTransparencyCountriesData([row('AT', 10)], {
			getCountryName: () => '',
		});

		expect(data.segments[0]?.countryName).toBe('AT');
	});
});
