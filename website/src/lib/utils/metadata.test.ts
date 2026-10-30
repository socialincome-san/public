import { formatPageDescription, formatPageTitle } from './metadata';

describe('formatPageTitle', () => {
	it('appends the brand to page titles', () => {
		expect(formatPageTitle('Transparency')).toBe('Transparency | Social Income');
	});

	it('falls back to the brand alone', () => {
		expect(formatPageTitle(undefined)).toBe('Social Income');
		expect(formatPageTitle('  ')).toBe('Social Income');
	});

	it('keeps titles that already start with the brand', () => {
		expect(formatPageTitle('Social Income: Direct Cash Transfers to People in Poverty')).toBe(
			'Social Income: Direct Cash Transfers to People in Poverty',
		);
	});

	it('shortens long titles at a word to fit 60 characters', () => {
		const title = formatPageTitle('We had the option to do nothing. We decided against it, and here is why.');

		expect(title).toBe('We had the option to do nothing. We decided… | Social Income');
		expect(title.length).toBeLessThanOrEqual(60);
	});
});

describe('formatPageDescription', () => {
	it('collapses whitespace and shortens to 160 characters', () => {
		const description = formatPageDescription(`Cash  transfers\n${'change lives '.repeat(20)}`);

		expect(description.startsWith('Cash transfers change lives')).toBe(true);
		expect(description.endsWith('…')).toBe(true);
		expect(description.length).toBeLessThanOrEqual(160);
	});
});
