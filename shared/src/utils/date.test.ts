import { Timestamp } from 'firebase/firestore';
import { DateTime } from 'luxon';
import { toFirebaseAdminTimestamp } from '../firebase/admin/utils';
import { daysUntilTs, getMonthId, getMonthIDs, toDate, toDateTime } from './date';

describe('getMonthId', () => {
	test('formats single digit month with leading zero', () => {
		expect(getMonthId(2023, 5)).toBe('2023-05');
	});

	test('formats double digit month correctly', () => {
		expect(getMonthId(2023, 12)).toBe('2023-12');
	});
});

describe('getMonthIDs', () => {
	test('returns correct number of months', () => {
		const date = new Date('2023-05-15');
		const result = getMonthIDs(date, 3);
		expect(result).toHaveLength(3);
	});

	test('handles year rollover correctly', () => {
		const date = new Date('2023-02-15');
		const result = getMonthIDs(date, 3);
		expect(result).toEqual(['2023-02', '2023-01', '2022-12']);
	});

	test('returns empty array for last_n = 0', () => {
		const date = new Date('2023-05-15');
		const result = getMonthIDs(date, 0);
		expect(result).toEqual([]);
	});
});

describe('toDateTime', () => {
	test('converts Date to DateTime', () => {
		const date = new Date('2023-05-15T12:00:00Z');
		const result = toDateTime(date);
		expect(result.isValid).toBe(true);
		expect(result.toISO()).toBe('2023-05-15T12:00:00.000Z');
	});

	test('converts number (milliseconds) to DateTime', () => {
		const timestamp = 1684147200000; // 2023-05-15T10:40:00Z
		const result = toDateTime(timestamp);
		expect(result.isValid).toBe(true);
		expect(result.toISO()).toBe('2023-05-15T10:40:00.000Z');
	});

	test('converts Timestamp to DateTime', () => {
		const timestamp = Timestamp.fromDate(new Date('2023-05-15T10:40:00Z'));
		const result = toDateTime(timestamp);
		expect(result.isValid).toBe(true);
		expect(result.toISO()).toBe('2023-05-15T10:40:00.000Z');
	});

	test('respects timezone parameter', () => {
		const date = new Date('2023-05-15T12:00:00Z');
		const result = toDateTime(date, 'America/New_York');
		expect(result.zoneName).toBe('America/New_York');
	});
});

describe('toDate', () => {
	test('converts DateTime to Date', () => {
		const dateTime = DateTime.fromISO('2023-05-15T12:00:00Z');
		const result = toDate(dateTime);
		expect(result instanceof Date).toBe(true);
		expect(result.toISOString()).toBe('2023-05-15T12:00:00.000Z');
	});
});

describe('daysUntilTs', () => {
	beforeEach(() => {
		// Mock current date to make tests deterministic
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2023-05-15T12:00:00Z'));
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test('calculates positive days for future date', () => {
		const futureDate = new Date('2023-05-20T12:00:00Z');
		expect(daysUntilTs(futureDate)).toBe(5);
	});

	test('calculates negative days for past date', () => {
		const pastDate = new Date('2023-05-10T12:00:00Z');
		expect(daysUntilTs(pastDate)).toBe(-5);
	});

	test('returns 0 for same day', () => {
		const sameDate = new Date('2023-05-15T12:00:00Z');
		expect(daysUntilTs(sameDate)).toBe(0);
	});
});

describe('toFirebaseAdminTimestamp', () => {
	test('converts Date to Timestamp', () => {
		const date = new Date('2023-05-15T12:00:00Z');
		const result = toFirebaseAdminTimestamp(date);
		expect(result.toDate().toISOString()).toBe('2023-05-15T12:00:00.000Z');
	});

	test('converts DateTime to Timestamp', () => {
		const dateTime = DateTime.fromISO('2023-05-15T12:00:00Z');
		const result = toFirebaseAdminTimestamp(dateTime);
		expect(result.toDate().toISOString()).toBe('2023-05-15T12:00:00.000Z');
	});
});
