import type { Article } from '@/generated/storyblok/types/109655/storyblok-components';
import { DOMParser } from '@xmldom/xmldom';
import { buildJournalRssFeed, type JournalRssArticle } from './journal-rss';

const article = (slug: string, title: string, date: string, author: string, leadText: string): JournalRssArticle => {
	return {
		slug,
		first_published_at: date,
		published_at: date,
		created_at: date,
		content: {
			title,
			leadText,
			author: {
				content: { fullName: author },
			} as unknown as Article['author'],
		},
	};
};

describe('buildJournalRssFeed', () => {
	it('serializes every article newest first with escaped fields', () => {
		const feed = buildJournalRssFeed(
			[
				article('older-story', 'Older & wiser', '2026-01-01T00:00:00.000Z', 'A. Author', 'An older excerpt.'),
				article('newer-story', 'New <story>', '2026-02-01T00:00:00.000Z', 'B. Author', 'A <useful> excerpt.'),
			],
			'https://example.test/en/int',
		);
		const document = new DOMParser().parseFromString(feed, 'text/xml');
		const items = Array.from(document.getElementsByTagName('item'));

		expect(document.documentElement?.nodeName).toBe('rss');
		expect(items).toHaveLength(2);
		expect(items[0].getElementsByTagName('title')[0].textContent).toBe('New <story>');
		expect(items[0].getElementsByTagName('link')[0].textContent).toBe('https://example.test/en/int/journal/newer-story');
		expect(items[0].getElementsByTagName('pubDate')[0].textContent).toBe('Sun, 01 Feb 2026 00:00:00 GMT');
		expect(items[0].getElementsByTagName('dc:creator')[0].textContent).toBe('B. Author');
		expect(items[0].getElementsByTagName('description')[0].textContent).toBe('A <useful> excerpt.');
	});

	it('uses a safe author fallback when a relation is unresolved', () => {
		const unresolved = article('draft-author', 'Published article', '2026-03-01T00:00:00.000Z', '', 'Excerpt');
		unresolved.content.author = 'unresolved-author-uuid';

		const document = new DOMParser().parseFromString(buildJournalRssFeed([unresolved]), 'text/xml');

		expect(document.getElementsByTagName('dc:creator')[0].textContent).toBe('Social Income');
	});
});
