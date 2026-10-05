const mockGetPublishedJournalArticles = jest.fn();

jest.mock('@/modules/journal/journal.service', () => ({
	getPublishedJournalArticles: mockGetPublishedJournalArticles,
}));

import { GET } from './route';

describe('journal RSS route', () => {
	beforeEach(() => {
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
		for (const language of ['en', 'de', 'fr', 'it'] as const) {
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
});
