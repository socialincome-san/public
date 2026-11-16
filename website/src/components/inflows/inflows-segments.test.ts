import { ContributionSourceType } from '@/generated/prisma/enums';
import { allocatePercents, buildInflowSegments, mapContributionSourcesToInflowSegments } from './inflows-segments';

describe('mapContributionSourcesToInflowSegments', () => {
	test('maps contribution source totals to transparency segments', () => {
		expect(
			mapContributionSourcesToInflowSegments({
				[ContributionSourceType.individual]: 630,
				[ContributionSourceType.foundation_grant]: 240,
				[ContributionSourceType.corporate_partner]: 130,
			}),
		).toEqual({ individuals: 630, foundations: 240, corporate: 130 });
	});
});

describe('allocatePercents', () => {
	test('returns zeros when total is zero', () => {
		expect(allocatePercents([0, 0, 0])).toEqual([0, 0, 0]);
	});

	test('allocates integers that sum to 100', () => {
		const percents = allocatePercents([63, 24, 13]);
		expect(percents.reduce((sum, value) => sum + value, 0)).toBe(100);
		expect(percents).toEqual([63, 24, 13]);
	});

	test('uses largest remainder so awkward ratios still sum to 100', () => {
		const percents = allocatePercents([1, 1, 1]);
		expect(percents.reduce((sum, value) => sum + value, 0)).toBe(100);
		expect(percents).toEqual([34, 33, 33]);
	});
});

describe('buildInflowSegments', () => {
	test('builds ordered segments with colors and percents', () => {
		const segments = buildInflowSegments({
			individuals: 630,
			foundations: 240,
			corporate: 130,
		});

		expect(segments.map(({ key, percent, amount }) => ({ key, percent, amount }))).toEqual([
			{ key: 'individuals', percent: 63, amount: 630 },
			{ key: 'foundations', percent: 24, amount: 240 },
			{ key: 'corporate', percent: 13, amount: 130 },
		]);
		expect(segments.every((segment) => typeof segment.color === 'string' && segment.color.length > 0)).toBe(true);
	});
});
