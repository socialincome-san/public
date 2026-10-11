const mockGetPublishedJournalArticles = jest.fn();

jest.mock('@/modules/journal/journal.cache', () => ({
	getPublishedJournalArticles: mockGetPublishedJournalArticles,
}));

import { GET } from './route';

describe('journal RSS route', () => {
	beforeEach(() => {
		mockGetPublishedJournalArticles.mockClear();
		mockGetPublishedJournalArticles.mockResolvedValue({
			success: true,
			data: [
				{
					slug: 'stable-story',
					first_published_at: '2026-01-01T00:00:00.000Z',
					published_at: '2026-01-01T00:00:00.000Z',
					created_at: '2026-01-01T00:00:00.000Z',
					content: { component: 'article', title: 'Stable story', author: 'author', leadText: 'Excerpt' },
				},
			],
		});
	});

	it('honors every language while keeping the feed identical for every currency', async () => {
		for (const language of ['en', 'de', 'fr', 'it', 'kri'] as const) {
			const usd = await GET(new Request(`https://socialincome.org/${language}/usd/journal/rss.xml`), {
				params: Promise.resolve({ lang: language, currency: 'usd' }),
			});
			const chf = await GET(new Request(`https://socialincome.org/${language}/chf/journal/rss.xml`), {
				params: Promise.resolve({ lang: language, currency: 'chf' }),
			});

			const usdText = await usd.text();
			const chfText = await chf.text();
			expect(usdText).toBe(chfText);
			expect(usdText).toContain(`<language>${language}</language>`);
			expect(usdText).toContain(`https://socialincome.org/${language}/journal/stable-story`);
			expect(mockGetPublishedJournalArticles).toHaveBeenCalledWith(language);
		}
	});

	it('returns 503 when article retrieval fails', async () => {
		mockGetPublishedJournalArticles.mockResolvedValue({ success: false, error: 'Load failed' });

		const response = await GET(new Request('https://socialincome.org/en/usd/journal/rss.xml'), {
			params: Promise.resolve({ lang: 'en', currency: 'usd' }),
		});

		expect(response.status).toBe(503);
		expect(await response.text()).toBe('Unable to load the journal feed.');
		expect(mockGetPublishedJournalArticles).toHaveBeenCalledWith('en');
	});

	it('rejects unsupported route languages before loading content', async () => {
		const response = await GET(new Request('https://socialincome.org/unknown/usd/journal/rss.xml'), {
			params: Promise.resolve({ lang: 'unknown', currency: 'usd' }),
		});

		expect(response.status).toBe(404);
		expect(mockGetPublishedJournalArticles).not.toHaveBeenCalled();
	});
});
