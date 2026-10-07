const mockGetPublishedJournalArticles = jest.fn();

jest.mock('@/modules/journal/journal.service', () => ({
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

	it('honors every language while keeping int and ch feeds identical', async () => {
		for (const language of ['en', 'de', 'fr', 'it', 'kri'] as const) {
			const international = await GET(new Request(`https://socialincome.org/${language}/int/journal/rss.xml`), {
				params: Promise.resolve({ lang: language, region: 'int' }),
			});
			const swiss = await GET(new Request(`https://socialincome.org/${language}/ch/journal/rss.xml`), {
				params: Promise.resolve({ lang: language, region: 'ch' }),
			});

			const internationalText = await international.text();
			const swissText = await swiss.text();
			expect(internationalText).toBe(swissText);
			expect(internationalText).toContain(`<language>${language}</language>`);
			expect(internationalText).toContain(`https://socialincome.org/${language}/journal/stable-story`);
			expect(mockGetPublishedJournalArticles).toHaveBeenCalledWith(language);
		}
	});

	it('returns 503 when article retrieval fails', async () => {
		mockGetPublishedJournalArticles.mockResolvedValue({ success: false, error: 'Load failed' });

		const response = await GET(new Request('https://socialincome.org/en/int/journal/rss.xml'), {
			params: Promise.resolve({ lang: 'en', region: 'int' }),
		});

		expect(response.status).toBe(503);
		expect(await response.text()).toBe('Unable to load the journal feed.');
		expect(mockGetPublishedJournalArticles).toHaveBeenCalledWith('en');
	});

	it('rejects unsupported route languages before loading content', async () => {
		const response = await GET(new Request('https://socialincome.org/unknown/int/journal/rss.xml'), {
			params: Promise.resolve({ lang: 'unknown', region: 'int' }),
		});

		expect(response.status).toBe(404);
		expect(mockGetPublishedJournalArticles).not.toHaveBeenCalled();
	});
});
