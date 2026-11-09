const mockFetchStoryblokStoriesPage = jest.fn();

jest.mock('@/integrations/storyblok/storyblok-content.integration', () => ({
	fetchStoryblokStoriesPage: mockFetchStoryblokStoriesPage,
}));
jest.mock('@/integrations/storyblok/storyblok-campaign.integration', () => ({}));
jest.mock('@/integrations/storyblok/storyblok-program.integration', () => ({}));
jest.mock('@/integrations/storyblok/storyblok-webhook.integration', () => ({}));
jest.mock('next/headers', () => ({
	draftMode: () => Promise.resolve({ isEnabled: false }),
}));

import { getLatestArticlesByArticleType, getLatestArticlesByTag } from './storyblok-content.service';

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
