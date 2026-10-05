import { defaultLanguage } from '@/lib/i18n/utils';

const mockGetOverviewAuthors = jest.fn();
const mockGetOverviewArticleTypes = jest.fn();
const mockGetPrimaryRoleLabels = jest.fn();
const mockGetTag = jest.fn();
const mockGetArticleType = jest.fn();
const mockGetArticlesByTag = jest.fn();
const mockGetArticlesByArticleType = jest.fn();
const mockGetArticlesByAuthor = jest.fn();
const mockGetOverviewArticles = jest.fn();
const mockGetArticleCountByTagForDefaultLang = jest.fn();
const mockGetArticleCountByArticleTypeForDefaultLang = jest.fn();
const mockGetArticleCountByAuthorForDefaultLang = jest.fn();
const mockGetOverviewArticlesCountForDefaultLang = jest.fn();
const mockGetArticle = jest.fn();
const mockGetPerson = jest.fn();
const mockGetRelativeArticles = jest.fn();
const mockGetLatestJournalArticles = jest.fn();
const mockGetArticlesByUuids = jest.fn();

jest.mock('@/modules/storyblok-content/storyblok-content.service', () => ({
	getOverviewAuthors: mockGetOverviewAuthors,
	getOverviewArticleTypes: mockGetOverviewArticleTypes,
	getPrimaryRoleLabels: mockGetPrimaryRoleLabels,
	getTag: mockGetTag,
	getArticleType: mockGetArticleType,
	getArticlesByTag: mockGetArticlesByTag,
	getArticlesByArticleType: mockGetArticlesByArticleType,
	getArticlesByAuthor: mockGetArticlesByAuthor,
	getOverviewArticles: mockGetOverviewArticles,
	getArticleCountByTagForDefaultLang: mockGetArticleCountByTagForDefaultLang,
	getArticleCountByArticleTypeForDefaultLang: mockGetArticleCountByArticleTypeForDefaultLang,
	getArticleCountByAuthorForDefaultLang: mockGetArticleCountByAuthorForDefaultLang,
	getOverviewArticlesCountForDefaultLang: mockGetOverviewArticlesCountForDefaultLang,
	getArticle: mockGetArticle,
	getPerson: mockGetPerson,
	getRelativeArticles: mockGetRelativeArticles,
	getLatestJournalArticles: mockGetLatestJournalArticles,
	getArticlesByUuids: mockGetArticlesByUuids,
}));

import { getJournalArticlePageData, getJournalOverviewPageData, getJournalPersonPageData } from './journal.service';

const labels = {
	homeLabel: 'Home',
	journalLabel: 'Journal',
	overviewTitle: 'Stories',
	overviewDescription: 'The latest stories',
};

const author = {
	uuid: 'author-1',
	slug: 'ada',
	content: {
		firstName: 'Ada',
		lastName: 'Lovelace',
		fullName: 'Ada Lovelace',
	},
};

const articleType = {
	uuid: 'type-1',
	slug: 'interview',
	name: 'Interview',
	content: {
		value: 'Interview',
		description: ' Conversations ',
	},
};

const article = {
	id: 1,
	uuid: 'article-1',
	slug: 'a-story',
	content: {
		title: 'A story',
		subtitle: 'with context',
		author,
		type: articleType,
		tags: [{ uuid: 'tag-1', slug: 'impact', content: { value: 'Impact' } }],
	},
};

beforeEach(() => {
	jest.clearAllMocks();
	mockGetOverviewAuthors.mockResolvedValue({ success: true, data: [author] });
	mockGetOverviewArticleTypes.mockResolvedValue({ success: true, data: [articleType] });
	mockGetPrimaryRoleLabels.mockResolvedValue({ success: true, data: { editor: 'Editor' } });
	mockGetArticlesByTag.mockResolvedValue({ success: true, data: [article] });
	mockGetArticlesByArticleType.mockResolvedValue({ success: true, data: [article] });
	mockGetArticlesByAuthor.mockResolvedValue({ success: true, data: [article] });
	mockGetOverviewArticles.mockResolvedValue({ success: true, data: [article] });
	mockGetArticleCountByTagForDefaultLang.mockResolvedValue({ success: true, data: 2 });
	mockGetArticleCountByArticleTypeForDefaultLang.mockResolvedValue({ success: true, data: 2 });
	mockGetArticleCountByAuthorForDefaultLang.mockResolvedValue({ success: true, data: 2 });
	mockGetOverviewArticlesCountForDefaultLang.mockResolvedValue({ success: true, data: 2 });
	mockGetArticle.mockResolvedValue({ success: true, data: article });
	mockGetPerson.mockResolvedValue({ success: true, data: author });
	mockGetRelativeArticles.mockResolvedValue({ success: true, data: [article] });
});

describe('getJournalOverviewPageData', () => {
	test('resolves tag filters, breadcrumbs, and translated pagination', async () => {
		mockGetTag.mockResolvedValue({
			success: true,
			data: {
				uuid: 'tag-1',
				slug: 'impact',
				content: { value: 'Impact', description: ' Positive change ' },
			},
		});

		const result = await getJournalOverviewPageData({
			lang: 'de',
			region: 'ch',
			labels,
			filter: { tagSlug: 'impact' },
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}
		expect(result.data).toMatchObject({
			articles: [article],
			activeTagSlug: 'impact',
			pageTitle: 'Impact',
			pageDescription: 'Positive change',
			pathname: '/de/ch/journal?tag=impact',
			showMoreArticlesLink: true,
			breadcrumbs: [
				{ label: 'Home', href: '/de/ch' },
				{ label: 'Journal', href: '/de/ch/journal' },
				{ label: 'Impact', href: '/de/ch/journal?tag=impact' },
			],
		});
		expect(mockGetArticlesByTag).toHaveBeenCalledWith('tag-1', 'de');
	});

	test('does not request a second count in the default language', async () => {
		await getJournalOverviewPageData({
			lang: defaultLanguage,
			region: 'ch',
			labels,
		});

		expect(mockGetOverviewArticlesCountForDefaultLang).not.toHaveBeenCalled();
	});

	test('returns a stable error when loading throws', async () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		mockGetOverviewAuthors.mockRejectedValue(new Error('provider details'));

		await expect(getJournalOverviewPageData({ lang: 'de', region: 'ch', labels })).resolves.toEqual({
			success: false,
			error: 'Could not load journal overview',
			status: undefined,
		});
		consoleError.mockRestore();
	});
});

describe('getJournalArticlePageData', () => {
	test('resolves related articles and article breadcrumbs', async () => {
		const result = await getJournalArticlePageData({
			lang: 'de',
			region: 'ch',
			slug: 'a-story',
			journalLabel: 'Journal',
			homeLabel: 'Home',
		});

		expect(result).toEqual({
			success: true,
			data: {
				story: article,
				relatedArticles: [article],
				breadcrumbs: [
					{ label: 'Home', href: '/de/ch' },
					{ label: 'Journal', href: '/de/ch/journal' },
					{ label: 'A story with context', href: '/de/ch/journal/a-story' },
				],
			},
			status: undefined,
		});
		expect(mockGetRelativeArticles).toHaveBeenCalledWith('author-1', 1, ['tag-1'], 'de', 3);
	});
});

describe('getJournalPersonPageData', () => {
	test('resolves articles, role labels, pagination, and person breadcrumbs', async () => {
		const result = await getJournalPersonPageData({
			lang: 'de',
			region: 'ch',
			slug: 'ada',
			journalLabel: 'Journal',
			homeLabel: 'Home',
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}
		expect(result.data).toMatchObject({
			person: author,
			articles: [article],
			roleLabels: { editor: 'Editor' },
			showMoreArticlesLink: true,
			pathname: '/de/ch/person/ada',
			breadcrumbs: [
				{ label: 'Home', href: '/de/ch' },
				{ label: 'Journal', href: '/de/ch/journal' },
				{ label: 'Ada Lovelace', href: '/de/ch/person/ada' },
			],
		});
	});
});
