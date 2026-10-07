import { DOMParser } from '@xmldom/xmldom';
import { buildJournalRssFeed, type JournalRssArticle } from './journal-rss';

const article = (
	slug: string,
	title: string,
	firstPublishedAt: string,
	publishedAt: string,
	leadText: string,
): JournalRssArticle =>
	({
		slug,
		first_published_at: firstPublishedAt,
		published_at: publishedAt,
		created_at: firstPublishedAt,
		updated_at: '2026-12-01T00:00:00.000Z',
		content: {
			component: 'article',
			title,
			leadText,
			author: { content: { fullName: 'A. Author' } },
		},
	}) as unknown as JournalRssArticle;

describe('buildJournalRssFeed', () => {
	it('uses the language path and produces identical canonical feeds for int and ch', () => {
		for (const language of ['en', 'de', 'fr', 'it']) {
			const articles = [
				article(`${language}-story`, `${language} story`, '2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z', 'Excerpt'),
			];
			const international = buildJournalRssFeed(articles, `https://socialincome.org/${language}`, language);
			const swiss = buildJournalRssFeed(articles, `https://socialincome.org/${language}`, language);

			expect(swiss).toBe(international);
			const document = new DOMParser().parseFromString(international, 'text/xml');
			expect(document.getElementsByTagName('language')[0].textContent).toBe(language);
			expect(document.getElementsByTagName('link')[1].textContent).toBe(
				`https://socialincome.org/${language}/journal/${language}-story`,
			);
		}
	});

	it('removes XML 1.0 control characters while preserving valid text', () => {
		const document = new DOMParser().parseFromString(
			buildJournalRssFeed([
				article('control', 'Valid\u000b title', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Lead\u000b text'),
			]),
			'text/xml',
		);

		expect(document.getElementsByTagName('parsererror')).toHaveLength(0);
		expect(document.getElementsByTagName('title')[1].textContent).toBe('Valid title');
		expect(document.getElementsByTagName('description')[1].textContent).toBe('Lead text');
	});

	it('advances lastBuildDate for republished articles but ignores draft-only updates', () => {
		const first = article('republished', 'Republished', '2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z', 'First');
		const newest = article('newest', 'Newest', '2026-05-01T00:00:00.000Z', '2026-05-01T00:00:00.000Z', 'Newest');
		const republished = { ...first, published_at: '2026-06-01T00:00:00.000Z', updated_at: '2026-07-01T00:00:00.000Z' };
		const before = buildJournalRssFeed([first, newest]);
		const after = buildJournalRssFeed([republished, newest]);

		expect(before).toContain('<lastBuildDate>Fri, 01 May 2026 00:00:00 GMT</lastBuildDate>');
		expect(after).toContain('<lastBuildDate>Mon, 01 Jun 2026 00:00:00 GMT</lastBuildDate>');
		expect(after).not.toContain('Wed, 01 Jul 2026 00:00:00 GMT');
	});
});
