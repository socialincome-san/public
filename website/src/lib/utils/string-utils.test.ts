import {
	formatCurrency,
	formatCurrencyLocale,
	formatDate,
	formatNumberLocale,
	humanize,
	humanizeIdentifier,
	slugify,
	titleCase,
} from './string-utils';

describe('string-utils', () => {
	describe('slugify', () => {
		const cases = [
			{ input: 'Hello World!', expected: 'hello-world' },
			{ input: '  Leading and trailing spaces  ', expected: 'leading-and-trailing-spaces' },
			{ input: 'Special #$&* Characters', expected: 'special-characters' },
			{ input: 'Multiple    Spaces', expected: 'multiple-spaces' },
			{ input: 'Accented éüçô Characters', expected: 'accented-characters' },
			{ input: 'Mixed CASE Input', expected: 'mixed-case-input' },
			{ input: '123 Numbers 456', expected: '123-numbers-456' },
			{ input: '---Dashes---and___underscores___', expected: 'dashes-and-underscores' },
			{ input: 'Emoji 😊 Test 🚀', expected: 'emoji-test' },
		];

		cases.forEach(({ input, expected }) => {
			test(`slugify("${input}") → "${expected}"`, () => {
				expect(slugify(input)).toBe(expected);
			});
		});
	});

	describe('humanize', () => {
		test('replaces underscores with spaces', () => {
			expect(humanize('american_express')).toBe('american express');
			expect(humanize('visa')).toBe('visa');
		});
	});

	describe('titleCase', () => {
		test('card brands and types', () => {
			expect(titleCase('visa')).toBe('Visa');
			expect(titleCase('american_express')).toBe('American Express');
			expect(titleCase('sepa_debit')).toBe('Sepa Debit');
		});
	});

	describe('humanizeIdentifier', () => {
		test('converts camelCase, snake_case and kebab-case to title words', () => {
			expect(humanizeIdentifier('programName')).toBe('Program Name');
			expect(humanizeIdentifier('local_partner_name')).toBe('Local Partner Name');
			expect(humanizeIdentifier('created-at')).toBe('Created At');
		});
	});

	describe('formatCurrency', () => {
		test('formats CHF with de-CH locale', () => {
			const amount = 1234;
			const expected = new Intl.NumberFormat('de-CH', {
				style: 'currency',
				currency: 'CHF',
				maximumFractionDigits: 0,
			}).format(amount);
			expect(formatCurrency(amount)).toBe(expected);
		});
	});

	describe('formatCurrencyLocale', () => {
		test('formats given currency and locale', () => {
			const amount = 9876.54;
			const expected = new Intl.NumberFormat('de-CH', {
				style: 'currency',
				currency: 'CHF',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}).format(amount);
			expect(formatCurrencyLocale(amount, 'CHF', 'de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe(
				expected,
			);
		});

		test('falls back for invalid currency', () => {
			const result = formatCurrencyLocale(1000, 'XXX', 'de-CH');
			expect(result).toContain('XXX');
		});

		test('uses compact currency format when threshold is reached', () => {
			const amount = 294_104_200;
			const expected = new Intl.NumberFormat('en', {
				style: 'currency',
				currency: 'CHF',
				notation: 'compact',
				compactDisplay: 'short',
				maximumFractionDigits: 1,
			}).format(amount);

			expect(formatCurrencyLocale(amount, 'CHF', 'de-CH', { compactThreshold: 1_000_000 })).toBe(expected);
		});

		test('keeps regular currency format when below compact threshold', () => {
			const amount = 999_999;
			const expected = new Intl.NumberFormat('de-CH', {
				style: 'currency',
				currency: 'CHF',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			}).format(amount);

			expect(formatCurrencyLocale(amount, 'CHF', 'de-CH', { compactThreshold: 1_000_000 })).toBe(expected);
		});
	});

	describe('formatNumberLocale', () => {
		test('formats integer numbers', () => {
			const value = 1234567;
			const expected = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
				value,
			);
			expect(formatNumberLocale(value, 'de-CH')).toBe(expected);
		});

		test('formats with fraction digits', () => {
			const value = 1234.5678;
			const expected = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
				value,
			);
			expect(formatNumberLocale(value, 'de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe(expected);
		});

		test('uses compact number format when threshold is reached', () => {
			const value = 294_104_200;
			const expected = new Intl.NumberFormat('en', {
				notation: 'compact',
				compactDisplay: 'short',
				maximumFractionDigits: 1,
			}).format(value);

			expect(formatNumberLocale(value, 'de-CH', { compactThreshold: 1_000_000 })).toBe(expected);
		});

		test('keeps regular number format when below compact threshold', () => {
			const value = 999_999;
			const expected = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
				value,
			);

			expect(formatNumberLocale(value, 'de-CH', { compactThreshold: 1_000_000 })).toBe(expected);
		});
	});

	describe('formatDate', () => {
		test('formats Date object', () => {
			const d = new Date('2026-02-17T00:00:00Z');
			expect(formatDate(d, 'dd.MM.yyyy')).toBe('17.02.2026');
		});

		test('formats ISO string', () => {
			expect(formatDate('2026-02-17', 'dd.MM.yyyy')).toBe('17.02.2026');
		});

		test('returns em dash for invalid', () => {
			expect(formatDate(null)).toBe('—');
			// Invalid date string should not throw
			expect(formatDate('invalid-date')).toBe('—');
		});
	});
});
