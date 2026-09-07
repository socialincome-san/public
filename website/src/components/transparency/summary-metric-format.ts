import { formatNumberLocale } from '@/lib/utils/string-utils';

export type SummaryMetricAmountParts = {
	value: string;
	suffix: 'k' | null;
};

export const formatSummaryMetricAmount = (value: number, locale: string): SummaryMetricAmountParts => {
	const rounded = Math.round(value);
	const abs = Math.abs(rounded);

	if (abs < 1_000) {
		return {
			value: formatNumberLocale(rounded, locale, { maximumFractionDigits: 0 }),
			suffix: null,
		};
	}

	if (abs < 1_000_000) {
		return {
			value: formatNumberLocale(Math.round(rounded / 1_000), locale, { maximumFractionDigits: 0 }),
			suffix: 'k',
		};
	}

	return {
		value: formatNumberLocale(rounded, locale, { maximumFractionDigits: 0 }),
		suffix: null,
	};
};
