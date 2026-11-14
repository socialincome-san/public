const mockFetchStoryblokStoriesPage = jest.fn();
const mockFetchStoryblokLinks = jest.fn();
const mockFetchStoryblokStory = jest.fn();

jest.mock('@/integrations/storyblok/storyblok-content.integration', () => ({
	fetchStoryblokStoriesPage: mockFetchStoryblokStoriesPage,
	fetchStoryblokLinks: mockFetchStoryblokLinks,
	fetchStoryblokStory: mockFetchStoryblokStory,
}));
jest.mock('@/integrations/storyblok/storyblok-campaign.integration', () => ({}));
jest.mock('@/integrations/storyblok/storyblok-program.integration', () => ({}));
jest.mock('@/integrations/storyblok/storyblok-webhook.integration', () => ({}));
jest.mock('next/headers', () => ({
	draftMode: () => Promise.resolve({ isEnabled: false }),
}));

import {
	getLatestArticlesByArticleType,
	getLatestArticlesByTag,
	getPagelessFolderName,
	getStoryWithFallback,
} from './storyblok-content.service';

const relation = { uuid: 'relation', content: {} };
const createArticle = (uuid: string) => ({ uuid, content: { author: relation, type: relation, tags: [relation] } });
const unresolvedArticle = { uuid: 'unresolved', content: { author: 'author-uuid', type: relation } };

describe('latest articles by tag or article type', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('requests the newest tagged articles in one page', async () => {
		mockFetchStoryblokStoriesPage.mockResolvedValue({ success: true, data: { stories: [], total: 0 } });

		await getLatestArticlesByTag('tag-1', 'de');

		expect(mockFetchStoryblokStoriesPage).toHaveBeenCalledWith(
			expect.objectContaining({
				language: 'de',
				version: 'published',
				sort_by: 'first_published_at:desc',
				content_type: 'article',
				filter_query: { tags: { any_in_array: 'tag-1' } },
			}),
		);
	});

	test('filters by article type', async () => {
		mockFetchStoryblokStoriesPage.mockResolvedValue({ success: true, data: { stories: [], total: 0 } });

		await getLatestArticlesByArticleType('type-1', 'en');

		expect(mockFetchStoryblokStoriesPage).toHaveBeenCalledWith(
			expect.objectContaining({ filter_query: { type: { in: 'type-1' } } }),
		);
	});

	test('skips unresolved articles and keeps the newest three', async () => {
		const stories = [unresolvedArticle, ...['a', 'b', 'c', 'd'].map(createArticle)];
		mockFetchStoryblokStoriesPage.mockResolvedValue({ success: true, data: { stories, total: stories.length } });

		const result = await getLatestArticlesByTag('tag-1', 'en');

		expect(result.success && result.data.map((article) => article.uuid)).toEqual(['a', 'b', 'c']);
	});

	test('passes Storyblok failures on', async () => {
		const failure = { success: false, error: 'Could not fetch Storyblok stories', status: 500 };
		mockFetchStoryblokStoriesPage.mockResolvedValue(failure);

		expect(await getLatestArticlesByArticleType('type-1', 'en')).toEqual(failure);
	});
});

describe('getStoryWithFallback for folders', () => {
	const notFound = { success: false, error: 'Could not fetch Storyblok story', status: 404 };
	const found = (slug: string) => ({ success: true, data: { full_slug: slug } });
	const fetchedSlugs = () => mockFetchStoryblokStory.mock.calls.map((call: unknown[]) => call[0]);

	beforeEach(() => {
		mockFetchStoryblokStory.mockReset();
		mockFetchStoryblokStory.mockImplementation((slug: string) =>
			Promise.resolve(slug.split('/').length > 3 || slug === 'pages/programs/programs' ? found(slug) : notFound),
		);
	});

	test('shows the overview story of a folder', async () => {
		expect(await getStoryWithFallback('pages/get-involved/individuals', 'en')).toEqual(
			found('pages/get-involved/individuals/individuals'),
		);
		expect(fetchedSlugs()).toEqual(['pages/get-involved/individuals', 'pages/get-involved/individuals/individuals']);
	});

	test('retries legacy folder paths with the overview they normalize to', async () => {
		expect(await getStoryWithFallback('pages/programs', 'en')).toEqual(found('pages/programs/programs'));
		expect(fetchedSlugs()).toEqual(['pages/programs', 'pages/programs/programs']);
	});

	test('treats a folder named like its parent as a folder', async () => {
		expect(await getStoryWithFallback('pages/give/give', 'en')).toEqual(found('pages/give/give/give'));
		expect(fetchedSlugs()).toEqual(['pages/give/give', 'pages/give/give/give']);
	});

	test('returns an existing overview story without retrying', async () => {
		mockFetchStoryblokStory.mockResolvedValue(found('pages/get-involved/get-involved'));

		expect(await getStoryWithFallback('pages/get-involved/get-involved', 'en')).toEqual(
			found('pages/get-involved/get-involved'),
		);
		expect(fetchedSlugs()).toEqual(['pages/get-involved/get-involved']);
	});
});

describe('getPagelessFolderName', () => {
	const folder = (slug: string, name: string) => ({
		uuid: slug,
		slug,
		name,
		is_folder: true,
		published: false,
		alternates: [
			{
				lang: 'de',
				path: '',
				name: name === 'Individuals' ? 'Privatpersonen' : null,
				published: null,
				translated_slug: slug,
			},
		],
	});
	const page = (slug: string) => ({ uuid: slug, slug, is_folder: false, published: true });

	beforeEach(() => {
		mockFetchStoryblokLinks.mockResolvedValue({
			success: true,
			data: [
				folder('pages/get-involved', 'Get involved'),
				folder('pages/get-involved/individuals', 'Individuals'),
				page('pages/get-involved/individuals/donate'),
				folder('pages/programs', 'programs'),
				page('pages/programs/programs'),
			],
		});
	});

	test('names a folder without a page in the requested language', async () => {
		expect(await getPagelessFolderName('pages/get-involved/individuals', 'de')).toEqual({
			success: true,
			data: 'Privatpersonen',
		});
	});

	test('falls back to the folder name', async () => {
		expect(await getPagelessFolderName('pages/get-involved', 'de')).toEqual({ success: true, data: 'Get involved' });
	});

	test('fails for a folder whose path has an overview page', async () => {
		expect((await getPagelessFolderName('pages/programs', 'en')).success).toBe(false);
	});
});
