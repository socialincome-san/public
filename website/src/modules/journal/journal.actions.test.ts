const mockGetJournalArticle = jest.fn();
const mockGetJournalArticlePageData = jest.fn();
const mockGetJournalArticlesByUuids = jest.fn();
const mockGetJournalPerson = jest.fn();
const mockGetJournalPersonPageData = jest.fn();
const mockGetLatestJournalArticles = jest.fn();

jest.mock('./journal.service', () => ({
	getJournalArticle: mockGetJournalArticle,
	getJournalArticlePageData: mockGetJournalArticlePageData,
	getJournalArticlesByUuids: mockGetJournalArticlesByUuids,
	getJournalPerson: mockGetJournalPerson,
	getJournalPersonPageData: mockGetJournalPersonPageData,
	getLatestJournalArticles: mockGetLatestJournalArticles,
}));

import {
	getJournalArticlePageDataAction,
	getJournalArticlesByUuidsAction,
	getLatestJournalArticlesAction,
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
});
