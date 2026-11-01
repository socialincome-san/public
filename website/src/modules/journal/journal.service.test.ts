import { defaultLanguage } from '@/lib/i18n/utils';

const mockGetOverviewAuthors = jest.fn();
const mockGetOverviewArticleTypes = jest.fn();
const mockGetPrimaryRoleLabels = jest.fn();
const mockGetCircleLabels = jest.fn();
const mockGetTimeCommitmentLabels = jest.fn();
const mockGetWorkStyleLabels = jest.fn();
const mockGetTag = jest.fn();
const mockGetArticleType = jest.fn();
const mockGetArticlesByTag = jest.fn();
const mockGetArticlesByArticleType = jest.fn();
const mockGetLatestArticlesByTag = jest.fn();
const mockGetLatestArticlesByArticleType = jest.fn();
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
const mockGetAllPersons = jest.fn();
const mockGetPersonContributions = jest.fn();

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({
	getOverviewAuthors: mockGetOverviewAuthors,
	getOverviewArticleTypes: mockGetOverviewArticleTypes,
	getPrimaryRoleLabels: mockGetPrimaryRoleLabels,
	getCircleLabels: mockGetCircleLabels,
	getTimeCommitmentLabels: mockGetTimeCommitmentLabels,
	getWorkStyleLabels: mockGetWorkStyleLabels,
	getTag: mockGetTag,
	getArticleType: mockGetArticleType,
	getArticlesByTag: mockGetArticlesByTag,
	getArticlesByArticleType: mockGetArticlesByArticleType,
	getLatestArticlesByTag: mockGetLatestArticlesByTag,
	getLatestArticlesByArticleType: mockGetLatestArticlesByArticleType,
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
	getAllPersons: mockGetAllPersons,
}));

jest.mock('@/modules/community/community.cache', () => ({
	getPersonContributions: mockGetPersonContributions,
}));

import {
	getJournalArticlePageData,
	getJournalArticlesByArticleType,
	getJournalArticlesByTag,
	getJournalOverviewPageData,
	getJournalPersonPageData,
} from './journal.service';

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
	mockGetCircleLabels.mockResolvedValue({ success: true, data: { 'tech-circle': 'tech-circle' } });
	mockGetTimeCommitmentLabels.mockResolvedValue({ success: true, data: { 'On a break': 'Pause' } });
	mockGetWorkStyleLabels.mockResolvedValue({ success: true, data: { 'Ad Hoc': 'Spontan' } });
	mockGetArticlesByTag.mockResolvedValue({ success: true, data: [article] });
	mockGetArticlesByArticleType.mockResolvedValue({ success: true, data: [article] });
	mockGetLatestArticlesByTag.mockResolvedValue({ success: true, data: [article] });
	mockGetLatestArticlesByArticleType.mockResolvedValue({ success: true, data: [article] });
	mockGetArticlesByAuthor.mockResolvedValue({ success: true, data: [article] });
	mockGetOverviewArticles.mockResolvedValue({ success: true, data: [article] });
	mockGetArticleCountByTagForDefaultLang.mockResolvedValue({ success: true, data: 2 });
	mockGetArticleCountByArticleTypeForDefaultLang.mockResolvedValue({ success: true, data: 2 });
	mockGetArticleCountByAuthorForDefaultLang.mockResolvedValue({ success: true, data: 2 });
	mockGetOverviewArticlesCountForDefaultLang.mockResolvedValue({ success: true, data: 2 });
	mockGetArticle.mockResolvedValue({ success: true, data: article });
	mockGetPerson.mockResolvedValue({ success: true, data: author });
	mockGetRelativeArticles.mockResolvedValue({ success: true, data: [article] });
	mockGetAllPersons.mockResolvedValue({ success: true, data: [] });
	mockGetPersonContributions.mockResolvedValue({ success: true, data: [] });
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
			currency: 'CHF',
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
			pathname: '/de/chf/journal?tag=impact',
			showMoreArticlesLink: true,
			breadcrumbs: [
				{ label: 'Home', href: '/de/chf' },
				{ label: 'Journal', href: '/de/chf/journal' },
				{ label: 'Impact', href: '/de/chf/journal?tag=impact' },
			],
		});
		expect(mockGetArticlesByTag).toHaveBeenCalledWith('tag-1', 'de');
	});

	test('does not request a second count in the default language', async () => {
		await getJournalOverviewPageData({
			lang: defaultLanguage,
			currency: 'CHF',
			labels,
		});

		expect(mockGetOverviewArticlesCountForDefaultLang).not.toHaveBeenCalled();
	});

	test('returns a stable error when loading throws', async () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		mockGetOverviewAuthors.mockRejectedValue(new Error('provider details'));

		await expect(getJournalOverviewPageData({ lang: 'de', currency: 'CHF', labels })).resolves.toEqual({
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
			currency: 'CHF',
			slug: 'a-story',
			parentLabel: 'Journal',
			homeLabel: 'Home',
		});

		expect(result).toEqual({
			success: true,
			data: {
				story: article,
				relatedArticles: [article],
				breadcrumbs: [
					{ label: 'Home', href: '/de/chf' },
					{ label: 'Journal', href: '/de/chf/journal' },
					{ label: 'A story', href: '/de/chf/journal/a-story' },
				],
			},
			status: undefined,
		});
		expect(mockGetRelativeArticles).toHaveBeenCalledWith('author-1', 1, ['tag-1'], 'de', 3);
	});
});

const volunteer = (uuid: string, circles: string[], overrides: Record<string, unknown> = {}) => ({
	uuid,
	slug: uuid,
	content: {
		volunteerStatus: 'active',
		activeCircleMember: circles,
		avatar: { filename: `${uuid}.jpg` },
		...overrides,
	},
});

describe('getJournalPersonPageData', () => {
	test('teases other active volunteers with a portrait, those from shared circles first', async () => {
		mockGetPerson.mockResolvedValue({
			success: true,
			data: { ...author, content: { ...author.content, activeCircleMember: ['tech'] } },
		});
		mockGetAllPersons.mockResolvedValue({
			success: true,
			data: [
				volunteer('other-circle', ['finance']),
				volunteer('same-circle', ['tech']),
				volunteer('inactive', ['tech'], { volunteerStatus: 'inactive' }),
				volunteer('no-portrait', ['tech'], { avatar: { filename: '' } }),
				volunteer('author-1', ['tech']),
			],
		});

		const result = await getJournalPersonPageData({
			lang: 'de',
			currency: 'CHF',
			slug: 'ada',
			parentLabel: 'People',
			homeLabel: 'Home',
		});

		expect(result.success && result.data.otherPersons.map((person) => person.uuid)).toEqual(['same-circle', 'other-circle']);
	});

	test('resolves articles, option labels, pagination, and person breadcrumbs', async () => {
		const result = await getJournalPersonPageData({
			lang: 'de',
			currency: 'CHF',
			slug: 'ada',
			parentLabel: 'People',
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
			circleLabels: { 'tech-circle': 'tech-circle' },
			timeCommitmentLabels: { 'On a break': 'Pause' },
			workStyleLabels: { 'Ad Hoc': 'Spontan' },
			showMoreArticlesLink: true,
			pathname: '/de/chf/person/ada',
			breadcrumbs: [
				{ label: 'Home', href: '/de/chf' },
				{ label: 'People', href: '/de/chf/people' },
				{ label: 'Ada Lovelace', href: '/de/chf/person/ada' },
			],
		});
	});
});

describe('getJournalArticlesByTag', () => {
	test('loads the articles with the tag', async () => {
		expect(await getJournalArticlesByTag('de', 'tag-1')).toEqual({ success: true, data: [article] });
		expect(mockGetLatestArticlesByTag).toHaveBeenCalledWith('tag-1', 'de');
	});

	test('fails when the articles cannot be loaded', async () => {
		mockGetLatestArticlesByTag.mockResolvedValueOnce({ success: false, error: 'Storyblok error', status: 500 });

		expect(await getJournalArticlesByTag('de', 'tag-1')).toMatchObject({
			success: false,
			error: 'Could not load journal articles',
		});
	});
});

describe('getJournalArticlesByArticleType', () => {
	test('loads the articles of the type', async () => {
		expect(await getJournalArticlesByArticleType('de', 'type-1')).toEqual({ success: true, data: [article] });
		expect(mockGetLatestArticlesByArticleType).toHaveBeenCalledWith('type-1', 'de');
	});

	test('fails when the articles cannot be loaded', async () => {
		mockGetLatestArticlesByArticleType.mockResolvedValueOnce({ success: false, error: 'Storyblok error', status: 500 });

		expect(await getJournalArticlesByArticleType('de', 'type-1')).toMatchObject({
			success: false,
			error: 'Could not load journal articles',
		});
	});
});
