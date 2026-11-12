import type { JournalArticle } from '@/modules/journal/journal.types';
import type { ISbStoryData } from '@storyblok/js';
import { getArticleSearchText, matchesArticleSearch } from './article-search';

const article = {
	content: {
		title: 'Cash Transfers in Sénégal',
		leadText: 'What we learned before they’re gone.',
		author: { content: { firstName: 'Ada', lastName: 'Okafor', fullName: 'Ada Okafor' } },
		type: { name: 'report', content: { value: 'Field Report' } },
		tags: [{ content: { value: 'Mobile Money' } }],
	},
} as unknown as ISbStoryData<JournalArticle>;

describe('article search', () => {
	const searchText = getArticleSearchText(article);

	test('collects title, lead text, author, tags and article type', () => {
		for (const part of ['cash transfers', 'before they', 'ada okafor', 'mobile money', 'field report']) {
			expect(searchText).toContain(part);
		}
	});

	test.each([
		['', true],
		['   ', true],
		['CASH', true],
		['senegal', true],
		['Sénégal okafor', true],
		['money report', true],
		["they're", true],
		['they’re', true],
		['cash kenya', false],
		['unrelated', false],
	])('query "%s" matches: %s', (query, expected) => {
		expect(matchesArticleSearch(searchText, query)).toBe(expected);
	});
});
