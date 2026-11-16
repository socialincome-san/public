import { getUtcCalendarDaysAgo } from './days-ago';

describe('getUtcCalendarDaysAgo', () => {
	it('counts calendar days, not 24 hour periods', () => {
		expect(getUtcCalendarDaysAgo(new Date('2026-03-09T23:59:00Z'), new Date('2026-03-10T00:01:00Z'))).toBe(1);
	});

	it('returns 0 within the same UTC day', () => {
		expect(getUtcCalendarDaysAgo(new Date('2026-03-10T00:00:00Z'), new Date('2026-03-10T23:59:59Z'))).toBe(0);
	});

	it('counts across month boundaries', () => {
		expect(getUtcCalendarDaysAgo(new Date('2026-02-27T12:00:00Z'), new Date('2026-03-02T12:00:00Z'))).toBe(3);
	});

	it('clamps future dates to 0', () => {
		expect(getUtcCalendarDaysAgo(new Date('2026-03-12T10:00:00Z'), new Date('2026-03-10T10:00:00Z'))).toBe(0);
	});
});
