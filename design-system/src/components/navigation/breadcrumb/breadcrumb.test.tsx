import { truncateBreadcrumbLabel } from './breadcrumb';

describe('truncateBreadcrumbLabel', () => {
	test.each([
		['Privacy Policy', 20, 'Privacy Policy'],
		['Universal Basic Income', 20, 'Universal Basic…'],
		['Recipient Selection Process', 20, 'Recipient Selection…'],
		['Supercalifragilisticexpialidocious', 20, 'Supercalifragilistic…'],
		['Privacy Policy', 12, 'Privacy…'],
		['Universal Basic Income', 12, 'Universal Basic…'],
		['Recipient Selection Process', 12, 'Recipient Selection…'],
		['Supercalifragilisticexpialidocious', 12, 'Supercalifra…'],
	])('truncates %s at %d characters', (label, limit, expected) => {
		expect(truncateBreadcrumbLabel(label, limit)).toBe(expected);
	});

	test.each([
		['Short', 12],
		['Exactly twelve', 14],
		['Exactly twenty chars', 20],
	])('preserves labels at or below the limit', (label, limit) => {
		expect(truncateBreadcrumbLabel(label, limit)).toBe(label);
	});

	test('keeps complete words before the boundary', () => {
		expect(truncateBreadcrumbLabel('One two threeeeee', 12)).toBe('One two…');
		expect(truncateBreadcrumbLabel('One    two threeeeee', 12)).toBe('One two…');
		expect(truncateBreadcrumbLabel('Longword Another', 8)).toBe('Longword…');
		expect(truncateBreadcrumbLabel('One two three', 7)).toBe('One two…');
	});

	test('uses available space rather than title-specific exceptions', () => {
		expect(truncateBreadcrumbLabel('Privacy Policy', 12)).toBe('Privacy…');
		expect(truncateBreadcrumbLabel('Alpha Bravo', 10)).toBe('Alpha…');
	});

	test('uses the character limit for a single long word', () => {
		expect(truncateBreadcrumbLabel('Supercalifragilisticexpialidocious', 20)).toBe('Supercalifragilistic…');
		expect(truncateBreadcrumbLabel('Supercalifragilisticexpialidocious', 12)).toBe('Supercalifra…');
	});
});
