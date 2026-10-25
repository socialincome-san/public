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
		expect(entries.every((entry) => entry.title.length > 0)).toBe(true);
		expect(entries.some((entry) => entry.id === '2026-10' && entry.title === 'Shoes, Stablecoins and Schools.')).toBe(true);
	});

	it('returns null for an invalid or missing newsletter ID', async () => {
		await expect(getNewsletterArchiveEntry('../2026-10')).resolves.toBeNull();
		await expect(getNewsletterArchiveEntry('9999-12')).resolves.toBeNull();
	});

	it('replaces merge fields and makes external links open safely in a new tab', () => {
		const html =
			'<p>{{ insert first_name \'default=there\' }}</p><a href="https://example.org" target="_self" rel="opener">Read</a><a href="{{{unsubscribe}}}">Unsubscribe</a>';

		const prepared = prepareNewsletterHtml(html);

		expect(prepared).toContain('<p>there</p>');
		expect(prepared).toContain('href="https://example.org" target="_blank" rel="noopener noreferrer"');
		expect(prepared).toContain('Unsubscribe');
		expect(prepared).not.toContain('<a href="{{{unsubscribe}}}">');
		expect(prepared).not.toContain('{{{unsubscribe}}}');
	});

	it('prepares every newsletter file without unresolved merge fields or unsafe external links', async () => {
		const entries = await getNewsletterArchiveEntries();

		for (const entry of entries) {
			const prepared = prepareNewsletterHtml(entry.html);

			expect(prepared).not.toMatch(/\{\{\s*insert\s+first_name/i);
			expect(prepared).not.toMatch(/\{\{\{\s*unsubscribe(?:_preferences)?\s*\}\}\}/i);

			for (const [anchor] of prepared.matchAll(/<a\b[^>]*>/gi)) {
				if (/\bhref\s*=\s*(["'])https?:\/\/[^"']*\1/i.test(anchor)) {
					expect(anchor).toMatch(/\btarget="_blank"/i);
					expect(anchor).toMatch(/\brel="noopener noreferrer"/i);
				}
			}
		}
	});

	it('formats month and year in the selected locale', () => {
		expect(formatNewsletterDate('2026-10', 'en')).toBe('October 2026');
		expect(formatNewsletterDate('2026-10', 'de')).toBe('Oktober 2026');
	});
});
