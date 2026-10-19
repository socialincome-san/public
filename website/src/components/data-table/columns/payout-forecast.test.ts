import { formatPayoutForecastPeriod, makePayoutForecastColumns } from './payout-forecast';

describe('formatPayoutForecastPeriod', () => {
	test('formats the month using the requested website language', () => {
		expect(formatPayoutForecastPeriod('2026-07', 'en')).toBe('July 2026');
		expect(formatPayoutForecastPeriod('2026-07', 'de')).toBe('Juli 2026');
	});

	test('preserves periods that do not use the expected year-month format', () => {
		expect(formatPayoutForecastPeriod('unknown', 'en')).toBe('unknown');
		expect(formatPayoutForecastPeriod('2026-13', 'en')).toBe('2026-13');
	});

	test('shows only the selected display currency for public forecasts', () => {
		const columns = makePayoutForecastColumns(undefined, undefined, undefined, undefined, {
			displayCurrency: 'EUR',
			lang: 'en',
		});

		expect(columns.map(({ id }) => id)).not.toContain('amountUsd');
		expect(columns.map(({ id }) => id)).toContain('amountInProgramCurrency');
	});
});
