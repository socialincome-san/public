import { formatSummaryMetricAmount } from '@/components/transparency/summary-metric-format';

describe('formatSummaryMetricAmount', () => {
	test('keeps whole numbers below one thousand unabbreviated', () => {
		expect(formatSummaryMetricAmount(42, 'en')).toEqual({ value: '42', suffix: null });
		expect(formatSummaryMetricAmount(999.4, 'en')).toEqual({ value: '999', suffix: null });
	});

	test('abbreviates thousands with a separate lowercase k and no decimals', () => {
		expect(formatSummaryMetricAmount(1_000, 'en')).toEqual({ value: '1', suffix: 'k' });
		expect(formatSummaryMetricAmount(42_000, 'en')).toEqual({ value: '42', suffix: 'k' });
		expect(formatSummaryMetricAmount(505_000, 'en')).toEqual({ value: '505', suffix: 'k' });
		expect(formatSummaryMetricAmount(1_234, 'en')).toEqual({ value: '1', suffix: 'k' });
	});

	test('keeps million-scale values unabbreviated', () => {
		const formatted = formatSummaryMetricAmount(1_500_000, 'en');

		expect(formatted.suffix).toBeNull();
		expect(formatted.value.replace(/\D/g, '')).toBe('1500000');
	});
});
