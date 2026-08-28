import { DateTime } from 'luxon';
import {
	getTransparencyFinancialPeriodDateFilter,
	getTransparencyFinancialPeriodRange,
	isRunwayInLineWithZewo,
} from './transparency.types';

describe('getTransparencyFinancialPeriodRange', () => {
	const parsedReferenceDate = DateTime.fromISO('2026-08-07T09:00:00Z', { zone: 'utc' });
	if (!parsedReferenceDate.isValid) {
		throw new Error('Expected a valid reference date');
	}
	const referenceDate = parsedReferenceDate;

	test('does not constrain all-time data', () => {
		expect(getTransparencyFinancialPeriodRange({ kind: 'all-time' }, referenceDate)).toBeUndefined();
	});

	test('returns the current year to date', () => {
		const range = getTransparencyFinancialPeriodRange({ kind: 'ytd' }, referenceDate);

		expect(range?.start.toISO()).toBe('2026-01-01T00:00:00.000Z');
		expect(range?.end).toBe(referenceDate);
	});

	test('returns the complete selected year', () => {
		const range = getTransparencyFinancialPeriodRange({ kind: 'year', year: 2025 }, referenceDate);

		expect(range?.start.toISO()).toBe('2025-01-01T00:00:00.000Z');
		expect(range?.end.toISO()).toBe('2026-01-01T00:00:00.000Z');
	});
});

describe('getTransparencyFinancialPeriodDateFilter', () => {
	const parsedReferenceDate = DateTime.fromISO('2026-08-07T09:00:00Z', { zone: 'utc' });
	if (!parsedReferenceDate.isValid) {
		throw new Error('Expected a valid reference date');
	}
	const referenceDate = parsedReferenceDate;

	test('returns undefined for all-time', () => {
		expect(getTransparencyFinancialPeriodDateFilter({ kind: 'all-time' }, referenceDate)).toBeUndefined();
	});

	test('maps period bounds to JS dates', () => {
		expect(getTransparencyFinancialPeriodDateFilter({ kind: 'year', year: 2025 }, referenceDate)).toEqual({
			gte: new Date('2025-01-01T00:00:00.000Z'),
			lt: new Date('2026-01-01T00:00:00.000Z'),
		});
	});
});

describe('isRunwayInLineWithZewo', () => {
	test('is true for an inclusive 3 to 18 month runway', () => {
		expect(isRunwayInLineWithZewo(2)).toBe(false);
		expect(isRunwayInLineWithZewo(3)).toBe(true);
		expect(isRunwayInLineWithZewo(16)).toBe(true);
		expect(isRunwayInLineWithZewo(18)).toBe(true);
		expect(isRunwayInLineWithZewo(19)).toBe(false);
	});
});
