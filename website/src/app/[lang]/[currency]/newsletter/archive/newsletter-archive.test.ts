import {
	formatNewsletterDate,
	getNewsletterArchiveEntries,
	getNewsletterArchiveEntry,
	prepareNewsletterHtml,
} from './newsletter-archive';

describe('newsletter archive', () => {
	it('lists newsletter files in reverse chronological order with titles extracted from h1', async () => {
		const entries = await getNewsletterArchiveEntries();

		expect(entries.length).toBeGreaterThan(0);
		expect(entries).toEqual([...entries].sort((left, right) => right.id.localeCompare(left.id)));
		expect(entries.every((entry) => entry.title.length > 0 && !entry.title.includes('{{'))).toBe(true);
		expect(entries.some((entry) => entry.id === '2024-05' && entry.title === 'Kindness, King and Trivia.')).toBe(true);
		expect(entries.some((entry) => entry.id === '2026-10' && entry.title === 'Shoes, Stablecoins and Schools.')).toBe(true);
	});

	it('returns null for an invalid or missing newsletter ID', async () => {
		await expect(getNewsletterArchiveEntry('../2026-10')).resolves.toBeNull();
		await expect(getNewsletterArchiveEntry('9999-12')).resolves.toBeNull();
	});

	it('replaces merge fields, drops unsubscribe links and opens links in a new tab', () => {
		const html =
			'<html><head></head><body><p>{{ insert first_name \'default=there\' }}</p><a href="{{{unsubscribe}}}">Unsubscribe</a></body></html>';

		const prepared = prepareNewsletterHtml(html);

		expect(prepared).toContain('<head><base target="_blank"></head>');
		expect(prepared).toContain('<p>there</p>');
		expect(prepared).toContain('Unsubscribe');
		expect(prepared).not.toContain('{{{unsubscribe}}}');
	});

	it('prepares every newsletter file without unresolved merge fields', async () => {
		const entries = await getNewsletterArchiveEntries();

		for (const entry of entries) {
			const prepared = prepareNewsletterHtml(entry.html);

			expect(prepared).not.toMatch(/\{\{/);
			expect(prepared).toContain('<base target="_blank">');
		}
	});

	it('formats month and year in the selected locale', () => {
		expect(formatNewsletterDate('2026-10', 'en')).toBe('October 2026');
		expect(formatNewsletterDate('2026-10', 'de')).toBe('Oktober 2026');
	});
});
