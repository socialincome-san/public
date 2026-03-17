import {
	CAMEL_CASE_BOUNDARY_REGEX,
	CAMPAIGN_SLUG_REGEX,
	CSV_DOUBLE_QUOTES_REGEX,
	CSV_NEEDS_QUOTES_REGEX,
	DATA_TABLE_FETCH_PREFIX_REGEX,
	E164_OPTIONAL_PHONE_REGEX,
	EMAIL_REGEX,
	LEADING_TRAILING_DASHES_REGEX,
	NEW_WEBSITE_CONFIRM_LOGIN_PATH_REGEX,
	NON_ALPHANUMERIC_DASH_REGEX,
	START_CHARACTER_REGEX,
	TITLE_CASE_UNDERSCORE_REGEX,
	TRAILING_SLASHES_REGEX,
	UNDERSCORE_DASH_SEQUENCE_REGEX,
	UNDERSCORE_REGEX,
	WEBSITE_AUTH_CONFIRM_LOGIN_PATH_REGEX,
	WHITESPACE_REGEX,
	WHITESPACE_SPLIT_REGEX,
	makeLanguagePrefixRegex,
	makeNewWebsiteSlugPrefixRegex,
} from './regex';

describe('regex utils', () => {
	test('EMAIL_REGEX validates emails', () => {
		expect(EMAIL_REGEX.test('user@example.com')).toBe(true);
		expect(EMAIL_REGEX.test('invalid-email')).toBe(false);
	});

	test('E164_OPTIONAL_PHONE_REGEX validates optional E.164 phone', () => {
		expect(E164_OPTIONAL_PHONE_REGEX.test('')).toBe(true);
		expect(E164_OPTIONAL_PHONE_REGEX.test('+41791234567')).toBe(true);
		expect(E164_OPTIONAL_PHONE_REGEX.test('0791234567')).toBe(false);
	});

	test('CAMPAIGN_SLUG_REGEX validates slug format', () => {
		expect(CAMPAIGN_SLUG_REGEX.test('my-campaign_1')).toBe(true);
		expect(CAMPAIGN_SLUG_REGEX.test('Invalid Slug')).toBe(false);
	});

	test('TRAILING_SLASHES_REGEX removes trailing slashes', () => {
		expect('https://example.com///'.replace(TRAILING_SLASHES_REGEX, '')).toBe('https://example.com');
	});

	test('UNDERSCORE_REGEX replaces underscores globally', () => {
		expect('a_b_c'.replace(UNDERSCORE_REGEX, ' ')).toBe('a b c');
	});

	test('WHITESPACE_REGEX replaces whitespace globally', () => {
		expect('a   b\tc'.replace(WHITESPACE_REGEX, '_')).toBe('a_b_c');
	});

	test('NON_ALPHANUMERIC_DASH_REGEX normalizes slug chunks', () => {
		expect('Hello, World!'.toLowerCase().replace(NON_ALPHANUMERIC_DASH_REGEX, '-')).toBe('hello-world-');
	});

	test('LEADING_TRAILING_DASHES_REGEX trims dashes on edges', () => {
		expect('--hello-world--'.replace(LEADING_TRAILING_DASHES_REGEX, '')).toBe('hello-world');
	});

	test('DATA_TABLE_FETCH_PREFIX_REGEX removes fetch prefix', () => {
		expect('Could not fetch campaigns: invalid query'.replace(DATA_TABLE_FETCH_PREFIX_REGEX, '')).toBe('invalid query');
	});

	test('CSV_DOUBLE_QUOTES_REGEX escapes double quotes', () => {
		expect('a"b"c'.replace(CSV_DOUBLE_QUOTES_REGEX, '""')).toBe('a""b""c');
	});

	test('CSV_NEEDS_QUOTES_REGEX detects csv escaping cases', () => {
		expect(CSV_NEEDS_QUOTES_REGEX.test('hello,world')).toBe(true);
		expect(CSV_NEEDS_QUOTES_REGEX.test('hello')).toBe(false);
	});

	test('CAMEL_CASE_BOUNDARY_REGEX inserts spaces between camel case words', () => {
		expect('helloWorld'.replace(CAMEL_CASE_BOUNDARY_REGEX, '$1 $2')).toBe('hello World');
	});

	test('UNDERSCORE_DASH_SEQUENCE_REGEX collapses underscores and dashes', () => {
		expect('a__b--c'.replace(UNDERSCORE_DASH_SEQUENCE_REGEX, ' ')).toBe('a b c');
	});

	test('WHITESPACE_SPLIT_REGEX splits on repeated whitespace', () => {
		expect('a   b\tc'.split(WHITESPACE_SPLIT_REGEX)).toEqual(['a', 'b', 'c']);
	});

	test('TITLE_CASE_UNDERSCORE_REGEX supports underscore title case replacement', () => {
		const transformed = 'hello_world'.replace(TITLE_CASE_UNDERSCORE_REGEX, (_s: string, c?: string, d?: string) =>
			c ? c.toUpperCase() : ` ${d?.toUpperCase() ?? ''}`,
		);
		expect(transformed).toBe('Hello World');
	});

	test('START_CHARACTER_REGEX matches first character only', () => {
		expect('hello'.replace(START_CHARACTER_REGEX, (s) => s.toUpperCase())).toBe('Hello');
	});

	test('WEBSITE_AUTH_CONFIRM_LOGIN_PATH_REGEX matches old website confirm path', () => {
		expect(WEBSITE_AUTH_CONFIRM_LOGIN_PATH_REGEX.test('/en/int/auth/confirm-login')).toBe(true);
		expect(WEBSITE_AUTH_CONFIRM_LOGIN_PATH_REGEX.test('/en/int/login')).toBe(false);
	});

	test('NEW_WEBSITE_CONFIRM_LOGIN_PATH_REGEX matches new website confirm path', () => {
		expect(NEW_WEBSITE_CONFIRM_LOGIN_PATH_REGEX.test('/en/int/new-website/auth/confirm-login')).toBe(true);
		expect(NEW_WEBSITE_CONFIRM_LOGIN_PATH_REGEX.test('/en/int/new-website/auth/finish-login')).toBe(false);
	});

	test('makeLanguagePrefixRegex escapes language and removes prefix', () => {
		const regex = makeLanguagePrefixRegex('en');
		expect('en/journal'.replace(regex, '')).toBe('journal');
	});

	test('makeNewWebsiteSlugPrefixRegex escapes slug and removes prefix', () => {
		const regex = makeNewWebsiteSlugPrefixRegex('new-website');
		expect('new-website/about'.replace(regex, '')).toBe('about');
	});
});
