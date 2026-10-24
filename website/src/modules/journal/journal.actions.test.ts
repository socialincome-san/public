const mockGetJournalArticle = jest.fn();
const mockGetJournalArticlePageData = jest.fn();
const mockGetJournalArticlesByUuids = jest.fn();
const mockGetJournalPerson = jest.fn();
const mockGetJournalPersonPageData = jest.fn();
const mockGetLatestJournalArticles = jest.fn();
const mockGetLatestJournalArticlesByTag = jest.fn();

jest.mock('./journal.cache', () => ({
	getJournalArticle: mockGetJournalArticle,
	getJournalArticlePageData: mockGetJournalArticlePageData,
	getJournalArticlesByUuids: mockGetJournalArticlesByUuids,
	getJournalPerson: mockGetJournalPerson,
	getJournalPersonPageData: mockGetJournalPersonPageData,
	getLatestJournalArticles: mockGetLatestJournalArticles,
	getLatestJournalArticlesByTag: mockGetLatestJournalArticlesByTag,
}));

import {
	getJournalArticlePageDataAction,
	getJournalArticlesByUuidsAction,
	getLatestJournalArticlesAction,
	getLatestJournalArticlesByTagAction,
} from './journal.actions';

describe('journal actions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('rejects an invalid article page request before calling the service', async () => {
		const result = await getJournalArticlePageDataAction({ lang: 'en' });

		expect(result).toEqual({
			success: false,
			error: 'Invalid journal article request',
			status: undefined,
		});
		expect(mockGetJournalArticlePageData).not.toHaveBeenCalled();
	});

	test('forwards validated article selections', async () => {
		mockGetJournalArticlesByUuids.mockResolvedValue({ success: true, data: [] });

		await getJournalArticlesByUuidsAction({
			language: 'de',
			articleUuids: ['article-1', 'article-2'],
		});

		expect(mockGetJournalArticlesByUuids).toHaveBeenCalledWith('de', ['article-1', 'article-2']);
	});

	test('accepts a language string for latest article teasers', async () => {
		mockGetLatestJournalArticles.mockResolvedValue({ success: true, data: [] });

		await getLatestJournalArticlesAction('en');

		expect(mockGetLatestJournalArticles).toHaveBeenCalledWith('en');
	});

	test('forwards validated tag teaser requests', async () => {
		mockGetLatestJournalArticlesByTag.mockResolvedValue({ success: true, data: [] });

		await getLatestJournalArticlesByTagAction({ language: 'fr', tagUuid: 'tag-1' });

		expect(mockGetLatestJournalArticlesByTag).toHaveBeenCalledWith('fr', 'tag-1');
	});

	test('rejects a tag teaser request without a tag', async () => {
		const result = await getLatestJournalArticlesByTagAction({ language: 'fr', tagUuid: '' });

		expect(result.success).toBe(false);
		expect(mockGetLatestJournalArticlesByTag).not.toHaveBeenCalled();
	});
});
