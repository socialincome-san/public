import { allocatePercents, buildInflowSegments, parseChfAmount, resolveIndividualsInflowsChf } from './inflows-segments';

describe('parseChfAmount', () => {
	test('returns 0 for missing or blank values', () => {
		expect(parseChfAmount(undefined)).toBe(0);
		expect(parseChfAmount('')).toBe(0);
		expect(parseChfAmount('   ')).toBe(0);
	});

	test('parses finite non-negative numbers', () => {
		expect(parseChfAmount('125000')).toBe(125000);
		expect(parseChfAmount('12.5')).toBe(12.5);
		expect(parseChfAmount('0')).toBe(0);
	});

	test('rejects invalid and negative values', () => {
		expect(parseChfAmount('abc')).toBe(0);
		expect(parseChfAmount('-10')).toBe(0);
		expect(parseChfAmount('Infinity')).toBe(0);
	});
});

describe('resolveIndividualsInflowsChf', () => {
	test('subtracts foundations and corporate from the donation total', () => {
		expect(resolveIndividualsInflowsChf(1000, 240, 130)).toBe(630);
	});

	test('never goes below zero', () => {
		expect(resolveIndividualsInflowsChf(100, 80, 50)).toBe(0);
		expect(resolveIndividualsInflowsChf(0, 10, 10)).toBe(0);
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
		const { segments, total } = buildInflowSegments({
			individuals: 630,
			foundations: 240,
			corporate: 130,
		});

		expect(total).toBe(1000);
		expect(segments.map(({ key, percent, amount }) => ({ key, percent, amount }))).toEqual([
			{ key: 'individuals', percent: 63, amount: 630 },
			{ key: 'foundations', percent: 24, amount: 240 },
			{ key: 'corporate', percent: 13, amount: 130 },
		]);
		expect(segments.every((segment) => typeof segment.color === 'string' && segment.color.length > 0)).toBe(true);
	});
});
