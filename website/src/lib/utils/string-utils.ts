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

const LOCALE_APOSTROPHE_REGEX = /['\u2018\u2019\u02BC]/g;

const normalizeIntlOutput = (value: string): string => {
	return value.replace(LOCALE_APOSTROPHE_REGEX, ',');
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

const COMPACT_THOUSAND_SUFFIX: Record<string, string> = {
	en: 'k',
	de: ' Tsd.',
	fr: ' k',
	it: 'k',
};

const getLocaleLanguage = (locale: string): string => locale.split('-')[0]?.toLowerCase() ?? 'en';

const formatThousandsCompact = (value: number, locale: string): string => {
	const abs = Math.abs(value);
	const sign = value < 0 ? '-' : '';
	const maximumFractionDigits = abs < 10_000 ? 1 : 0;
	const intlCompact = normalizeIntlOutput(
		new Intl.NumberFormat(locale, {
			notation: 'compact',
			compactDisplay: 'short',
			maximumFractionDigits,
		}).format(abs),
	);
	const fullFormatted = normalizeIntlOutput(new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(abs));

	if (intlCompact !== fullFormatted) {
		return `${sign}${intlCompact}`;
	}

	const scaled = abs / 1_000;
	const scaledFormatted = normalizeIntlOutput(
		new Intl.NumberFormat(locale, { maximumFractionDigits, minimumFractionDigits: 0 }).format(scaled),
	);
	const suffix = COMPACT_THOUSAND_SUFFIX[getLocaleLanguage(locale)] ?? COMPACT_THOUSAND_SUFFIX.en;

	return `${sign}${scaledFormatted}${suffix}`;
};

export const formatCompactNumberLocale = (value: number, locale: string): string => {
	if (!Number.isFinite(value)) {
		return '0';
	}

	const abs = Math.abs(value);

	if (abs < 1_000) {
		return formatNumberLocale(value, locale);
	}

	if (abs >= 1_000_000) {
		return normalizeIntlOutput(
			new Intl.NumberFormat(locale, {
				notation: 'compact',
				compactDisplay: 'short',
				maximumFractionDigits: 2,
			}).format(value),
		);
	}

	return formatThousandsCompact(value, locale);
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

export const isSafeHref = (value: string) => {
	if (value.startsWith('/') && !value.startsWith('//')) {
		return true;
	}
	try {
		const protocol = new URL(value).protocol.toLowerCase();

		return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:';
	} catch {
		return false;
	}
};
