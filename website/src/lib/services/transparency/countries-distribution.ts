import type { CountryCode } from '@/generated/prisma/enums';
import { assignFlagColors } from '@/lib/utils/country-flag-color';
import {
	OTHER_COUNTRY_SEGMENT_CODE,
	type CountryContributionRow,
	type TransparencyCountriesData,
	type TransparencyCountrySegment,
} from './transparency.types';

export const TOP_CONTRIBUTING_COUNTRIES_LIMIT = 15;
export const COUNTRY_DISTRIBUTION_UNIT_COUNT = 100;

export const OTHER_SEGMENT_COLOR = 'hsl(var(--muted-foreground) / 0.4)';

export type TranslationTemplatePart = { type: 'text'; value: string } | { type: 'placeholder'; key: string };

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

export const splitTranslationTemplate = (template: string): TranslationTemplatePart[] => {
	const parts: TranslationTemplatePart[] = [];
	let lastIndex = 0;

	for (const match of template.matchAll(PLACEHOLDER_REGEX)) {
		const matchIndex = match.index ?? 0;
		if (matchIndex > lastIndex) {
			parts.push({ type: 'text', value: template.slice(lastIndex, matchIndex) });
		}

		const key = match[1];
		if (key) {
			parts.push({ type: 'placeholder', key });
		}
		lastIndex = matchIndex + match[0].length;
	}

	if (lastIndex < template.length) {
		parts.push({ type: 'text', value: template.slice(lastIndex) });
	}

	return parts;
};

export const allocateUnitCounts = (weights: number[], totalUnits = COUNTRY_DISTRIBUTION_UNIT_COUNT): number[] => {
	if (weights.length === 0) {
		return [];
	}

	const sum = weights.reduce((total, weight) => total + weight, 0);
	if (sum <= 0) {
		return weights.map(() => 0);
	}

	const exactShares = weights.map((weight) => (weight / sum) * totalUnits);
	const unitCounts = exactShares.map(Math.floor);
	let remainder = totalUnits - unitCounts.reduce((total, count) => total + count, 0);

	const remainderOrder = exactShares
		.map((share, index) => ({ index, fraction: share - (unitCounts[index] ?? 0) }))
		.sort((left, right) => right.fraction - left.fraction || left.index - right.index);

	for (const { index } of remainderOrder) {
		if (remainder <= 0) {
			break;
		}
		unitCounts[index] = (unitCounts[index] ?? 0) + 1;
		remainder -= 1;
	}

	return unitCounts;
};

export const formatPercentageDisplay = (percentageOfTotal: number, amount: number): string => {
	if (amount > 0 && Math.round(percentageOfTotal) === 0) {
		return '<1%';
	}

	return `${Math.round(percentageOfTotal)}%`;
};

export const buildTransparencyCountriesData = (
	rows: CountryContributionRow[],
	options: {
		limit?: number;
		getCountryName: (countryCode: CountryCode) => string;
		getCountryColors?: (countryCode: CountryCode) => string[];
	},
): TransparencyCountriesData => {
	const limit = options.limit ?? TOP_CONTRIBUTING_COUNTRIES_LIMIT;
	const countries = rows
		.filter((row) => row.totalChf > 0)
		.sort((left, right) => right.totalChf - left.totalChf || left.countryCode.localeCompare(right.countryCode));

	const totalContributionsChf = countries.reduce((sum, row) => sum + row.totalChf, 0);
	if (countries.length === 0 || totalContributionsChf <= 0) {
		return {
			totalContributionsChf: 0,
			countriesCount: 0,
			segments: [],
			otherCountries: [],
		};
	}

	const topCountries = countries.slice(0, limit);
	const otherCountries = countries.slice(limit);
	const otherTotalChf = otherCountries.reduce((sum, row) => sum + row.totalChf, 0);
	const otherContributorCount = otherCountries.reduce((sum, row) => sum + row.contributorCount, 0);

	const unresolvedSegments = [
		...topCountries.map((row) => ({
			countryCode: row.countryCode,
			countryName: options.getCountryName(row.countryCode) || row.countryCode,
			totalChf: row.totalChf,
			contributorCount: row.contributorCount,
		})),
		...(otherCountries.length > 0
			? [
					{
						countryCode: OTHER_COUNTRY_SEGMENT_CODE,
						countryName: '',
						totalChf: otherTotalChf,
						contributorCount: otherContributorCount,
					},
				]
			: []),
	];

	const unitCounts = allocateUnitCounts(unresolvedSegments.map((segment) => segment.totalChf));
	const countryColorByCode = options.getCountryColors
		? assignFlagColors(
				unresolvedSegments.flatMap((segment) =>
					segment.countryCode === OTHER_COUNTRY_SEGMENT_CODE ? [] : [segment.countryCode],
				),
				options.getCountryColors,
			)
		: new Map<CountryCode, string>();
	const segments: TransparencyCountrySegment[] = unresolvedSegments.map((segment, index) => ({
		countryCode: segment.countryCode,
		countryName: segment.countryName,
		totalChf: segment.totalChf,
		percentageOfTotal: (segment.totalChf / totalContributionsChf) * 100,
		unitCount: unitCounts[index] ?? 0,
		color:
			segment.countryCode === OTHER_COUNTRY_SEGMENT_CODE
				? OTHER_SEGMENT_COLOR
				: (countryColorByCode.get(segment.countryCode) ?? OTHER_SEGMENT_COLOR),
		contributorCount: segment.contributorCount,
	}));

	return {
		totalContributionsChf,
		countriesCount: countries.length,
		segments,
		otherCountries: otherCountries.map((row) => ({
			countryCode: row.countryCode,
			countryName: options.getCountryName(row.countryCode) || row.countryCode,
			totalChf: row.totalChf,
		})),
	};
};
