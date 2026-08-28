import type { CountryCode } from '@/generated/prisma/enums';
import { assignFlagColors } from '@/lib/utils/country-flag-color';
import {
	OTHER_COUNTRY_SEGMENT_CODE,
	type CountryContributionRow,
	type TransparencyCountriesData,
	type TransparencyCountrySegment,
	type TransparencyCountrySegmentCode,
} from './transparency.types';

export const TOP_CONTRIBUTING_COUNTRIES_LIMIT = 15;
export const COUNTRY_DISTRIBUTION_UNIT_COUNT = 100;

export const OTHER_SEGMENT_COLOR = 'hsl(var(--muted-foreground) / 0.4)';

export const compareCountryContributionRows = (left: CountryContributionRow, right: CountryContributionRow): number => {
	return right.totalChf - left.totalChf || left.countryCode.localeCompare(right.countryCode);
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

	for (const [index, weight] of weights.entries()) {
		if (weight <= 0 || (unitCounts[index] ?? 0) > 0) {
			continue;
		}

		const donorIndex = unitCounts.reduce(
			(largestIndex, count, candidateIndex) => (count > (unitCounts[largestIndex] ?? 0) ? candidateIndex : largestIndex),
			0,
		);
		if ((unitCounts[donorIndex] ?? 0) <= 1) {
			break;
		}

		unitCounts[donorIndex] = (unitCounts[donorIndex] ?? 0) - 1;
		unitCounts[index] = 1;
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
		getCountryColors?: (countryCode: CountryCode) => string[];
	} = {},
): TransparencyCountriesData => {
	const requestedLimit = options.limit ?? TOP_CONTRIBUTING_COUNTRIES_LIMIT;
	const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.floor(requestedLimit)) : TOP_CONTRIBUTING_COUNTRIES_LIMIT;
	const countries = [...rows].filter((row) => row.totalChf > 0).sort(compareCountryContributionRows);

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

	const unresolvedSegments: {
		countryCode: TransparencyCountrySegmentCode;
		totalChf: number;
	}[] = topCountries.map((row) => ({
		countryCode: row.countryCode,
		totalChf: row.totalChf,
	}));
	if (otherCountries.length > 0) {
		unresolvedSegments.push({
			countryCode: OTHER_COUNTRY_SEGMENT_CODE,
			totalChf: otherTotalChf,
		});
	}

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
		totalChf: segment.totalChf,
		percentageOfTotal: (segment.totalChf / totalContributionsChf) * 100,
		unitCount: unitCounts[index] ?? 0,
		color:
			segment.countryCode === OTHER_COUNTRY_SEGMENT_CODE
				? OTHER_SEGMENT_COLOR
				: (countryColorByCode.get(segment.countryCode) ?? OTHER_SEGMENT_COLOR),
	}));

	return {
		totalContributionsChf,
		countriesCount: countries.length,
		segments,
		otherCountries: otherCountries.map((row) => ({
			countryCode: row.countryCode,
			totalChf: row.totalChf,
		})),
	};
};
