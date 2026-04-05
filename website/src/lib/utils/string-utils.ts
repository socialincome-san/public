import { format } from 'date-fns';
import {
	CAMEL_CASE_BOUNDARY_REGEX,
	LEADING_TRAILING_DASHES_REGEX,
	NON_ALPHANUMERIC_DASH_REGEX,
	TITLE_CASE_UNDERSCORE_REGEX,
	UNDERSCORE_DASH_SEQUENCE_REGEX,
	UNDERSCORE_REGEX,
	WHITESPACE_SPLIT_REGEX,
} from './regex';

const LOCALE_APOSTROPHE_REGEX = /[\u2018\u2019\u02BC]/g;

const normalizeIntlOutput = (value: string): string => {
	return value.replace(LOCALE_APOSTROPHE_REGEX, "'");
};

export const slugify = (value: string): string => {
	return value.toLowerCase().trim().replace(NON_ALPHANUMERIC_DASH_REGEX, '-').replace(LEADING_TRAILING_DASHES_REGEX, '');
};

export const formatCurrency = (value: number): string => {
	return normalizeIntlOutput(
		new Intl.NumberFormat('de-CH', {
			style: 'currency',
			currency: 'CHF',
			maximumFractionDigits: 0,
		}).format(value),
	);
};

export const formatCurrencyLocale = (
	amount: number,
	currency: string,
	locale: string,
	options: {
		minimumFractionDigits?: number;
		maximumFractionDigits?: number;
		compactThreshold?: number;
		compactLocale?: string;
		compactMaximumFractionDigits?: number;
	} = {},
): string => {
	const {
		minimumFractionDigits = 0,
		maximumFractionDigits = 0,
		compactThreshold = Number.POSITIVE_INFINITY,
		compactLocale = 'en',
		compactMaximumFractionDigits = 1,
	} = options;

	if (Math.abs(amount) >= compactThreshold) {
		try {
			return normalizeIntlOutput(
				new Intl.NumberFormat(compactLocale, {
					style: 'currency',
					currency,
					notation: 'compact',
					compactDisplay: 'short',
					maximumFractionDigits: compactMaximumFractionDigits,
				}).format(amount),
			);
		} catch {
			// Fallback to regular currency formatting below.
		}
	}

	try {
		return normalizeIntlOutput(
			new Intl.NumberFormat(locale, {
				style: 'currency',
				currency,
				minimumFractionDigits,
				maximumFractionDigits,
			}).format(amount),
		);
	} catch {
		const num = normalizeIntlOutput(
			new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits }).format(amount),
		);

		return `${num} ${currency}`;
	}
};

export const humanize = (value: string): string => {
	return value.replace(UNDERSCORE_REGEX, ' ');
};

export const humanizeIdentifier = (value: string): string => {
	return value
		.replace(CAMEL_CASE_BOUNDARY_REGEX, '$1 $2')
		.replace(UNDERSCORE_DASH_SEQUENCE_REGEX, ' ')
		.trim()
		.split(WHITESPACE_SPLIT_REGEX)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

export const titleCase = (value: string): string => {
	return value.replace(TITLE_CASE_UNDERSCORE_REGEX, (_s: string, c?: string, d?: string) =>
		c ? c.toUpperCase() : ` ${d?.toUpperCase() ?? ''}`,
	);
};

export const formatNumberLocale = (
	value: number,
	locale: string,
	options: {
		minimumFractionDigits?: number;
		maximumFractionDigits?: number;
		compactThreshold?: number;
		compactLocale?: string;
		compactMaximumFractionDigits?: number;
	} = {},
): string => {
	const {
		minimumFractionDigits = 0,
		maximumFractionDigits = 0,
		compactThreshold = Number.POSITIVE_INFINITY,
		compactLocale = 'en',
		compactMaximumFractionDigits = 1,
	} = options;

	if (Math.abs(value) >= compactThreshold) {
		return normalizeIntlOutput(
			new Intl.NumberFormat(compactLocale, {
				notation: 'compact',
				compactDisplay: 'short',
				maximumFractionDigits: compactMaximumFractionDigits,
			}).format(value),
		);
	}

	return normalizeIntlOutput(new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits }).format(value));
};

export const formatDate = (date: Date | string | null | undefined, pattern = 'dd.MM.yyyy'): string => {
	if (!date) {
		return '—';
	}
	const d = typeof date === 'string' ? new Date(date) : date;
	try {
		return format(d, pattern);
	} catch {
		return '—';
	}
};
