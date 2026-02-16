import type { Author, Topic } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage } from '@/lib/i18n/utils';
import type { ISbStories, ISbStoriesParams, ISbStory, ISbStoryData } from '@storyblok/js';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { BaseService } from '../core/base.service';
import { getStoryblokApi } from './storyblok.config';
import type { ResolvedArticle } from './storyblok.utils';

enum StoryblokContentType {
	Article = 'article',
	Author = 'author',
	Tag = 'topic',
}

const STANDARD_ARTICLE_RELATIONS_TO_RESOLVE = ['article.author', 'article.tags', 'article.type'];
const DEFAULT_PAGE_SIZE = 50;
const CONTENT = 'content';
const LEAD_TEXT = 'leadText';
const STORIES_PATH = 'cdn/stories';
const EXCLUDED_FIELDS_FOR_COUNTING = [CONTENT, LEAD_TEXT].join(',');

export class StoryblokService extends BaseService {
	// ==================== Core API Helpers ====================

	/**
	 * Get story parameters including language and version (draft/published).
	 */
	async getStoryParams(language: string): Promise<ISbStoriesParams> {
		return {
			language,
			version: (await draftMode()).isEnabled ? 'draft' : 'published',
		};
	}

	/**
	 * Generic fallback logic for language - tries requested language first, then falls back to default.
	 */
	async withLanguageFallback<T>(
		loader: (lang: string, slug: string) => Promise<T>,
		lang: string,
		slug: string,
	): Promise<T> {
		try {
			return await loader(lang, slug);
		} catch (error: any) {
			if (error?.status === 404) {
				if (lang === defaultLanguage) {
					return notFound();
				}
				return await this.withLanguageFallback(loader, defaultLanguage, slug);
			}
			throw error;
		}
	}

	/**
	 * Fetch a story with automatic language fallback.
	 */
	async getStoryWithFallback<T>(slug: string, lang: string): Promise<T> {
		return this.withLanguageFallback(
			async (language: string) => {
				const response = await getStoryblokApi().get(`cdn/stories/${slug}`, await this.getStoryParams(language));
				return response.data.story as T;
			},
			lang,
			slug,
		);
	}

	// ==================== Article Counts ====================

	/**
	 * Get count of overview articles for the default language.
	 * Storyblok doesn't support aggregation functions, so we query with limit 1 to get the total count.
	 */
	async getOverviewArticlesCountForDefaultLang(): Promise<number> {
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(defaultLanguage)),
			per_page: 1,
			excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
			content_type: StoryblokContentType.Article,
			filter_query: {
				displayInOverviewPage: {
					is: true,
				},
			},
		};
		return (await getStoryblokApi().get(STORIES_PATH, params)).total;
	}

	/**
	 * Get count of articles by tag for the default language.
	 */
	async getArticleCountByTagForDefaultLang(tagId: string): Promise<number> {
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(defaultLanguage)),
			per_page: 1,
			excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
			content_type: StoryblokContentType.Article,
			filter_query: this.articleByTagsFilter(tagId),
		};
		return (await getStoryblokApi().get(STORIES_PATH, params)).total;
	}

	/**
	 * Get count of articles by author for the default language.
	 */
	async getArticleCountByAuthorForDefaultLang(authorId: string): Promise<number> {
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(defaultLanguage)),
			per_page: 1,
			excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
			content_type: StoryblokContentType.Article,
			filter_query: this.articlesByAuthorFilter(authorId),
		};
		return (await getStoryblokApi().get(STORIES_PATH, params)).total;
	}

	// ==================== Authors & Tags ====================

	async getOverviewAuthors(lang: string): Promise<ISbStoryData<Author>[]> {
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(lang)),
			content_type: StoryblokContentType.Author,
			filter_query: {
				displayInOverviewPage: {
					is: true,
				},
			},
		};
		return getStoryblokApi().getAll(STORIES_PATH, params);
	}

	async getOverviewTags(lang: string): Promise<ISbStoryData<Topic>[]> {
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(lang)),
			content_type: StoryblokContentType.Tag,
			filter_query: {
				displayInOverviewPage: {
					is: true,
				},
			},
		};
		return getStoryblokApi().getAll(STORIES_PATH, params);
	}

	async getTag(slug: string, lang: string): Promise<ISbStory<Topic>> {
		return this.withLanguageFallback(
			async (lang: string, slug: string): Promise<ISbStory<Topic>> => {
				return getStoryblokApi().get(`cdn/stories/tag/${slug}`, await this.getStoryParams(lang));
			},
			lang,
			slug,
		);
	}

	async getAuthor(slug: string, lang: string): Promise<ISbStory<Author>> {
		return this.withLanguageFallback(
			async (lang: string, slug: string): Promise<ISbStory<Author>> => {
				return getStoryblokApi().get(`cdn/stories/author/${slug}`, await this.getStoryParams(lang));
			},
			lang,
			slug,
		);
	}

	// ==================== Articles ====================

	async getArticlesByTag(tagId: string, lang: string): Promise<ISbStoryData<ResolvedArticle>[]> {
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(lang)),
			per_page: DEFAULT_PAGE_SIZE,
			resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
			excluding_fields: CONTENT,
			sort_by: 'first_published_at:desc',
			content_type: StoryblokContentType.Article,
			filter_query: this.articleByTagsFilter(tagId),
		};
		return getStoryblokApi().getAll(STORIES_PATH, params);
	}

	async getArticlesByAuthor(authorId: string, lang: string): Promise<ISbStoryData<ResolvedArticle>[]> {
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(lang)),
			per_page: DEFAULT_PAGE_SIZE,
			excluding_fields: CONTENT,
			resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
			sort_by: 'first_published_at:desc',
			content_type: StoryblokContentType.Article,
			filter_query: this.articlesByAuthorFilter(authorId),
		};
		return getStoryblokApi().getAll(STORIES_PATH, params);
	}

	async getOverviewArticles(
		lang: string,
		idsToIgnore: string | undefined = undefined,
		limit: number | undefined = undefined,
	): Promise<ISbStoryData<ResolvedArticle>[]> {
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(lang)),
			per_page: limit || DEFAULT_PAGE_SIZE,
			excluding_fields: CONTENT,
			resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
			sort_by: 'first_published_at:desc',
			content_type: StoryblokContentType.Article,
			filter_query: {
				displayInOverviewPage: {
					is: true,
				},
			},
			...(idsToIgnore ? { excluding_ids: idsToIgnore } : {}),
		};
		if (limit) {
			return (await getStoryblokApi().get(STORIES_PATH, params)).data.stories;
		} else {
			return getStoryblokApi().getAll(STORIES_PATH, params);
		}
	}

	async getArticle(lang: string, slug: string): Promise<ISbStory<ResolvedArticle>> {
		return this.withLanguageFallback(
			async (lang: string, slug: string): Promise<ISbStory<ResolvedArticle>> => {
				const params: ISbStoriesParams = {
					...(await this.getStoryParams(lang)),
					resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
				};
				return getStoryblokApi().get(`cdn/stories/journal/${slug}`, params);
			},
			lang,
			slug,
		);
	}

	/**
	 * Returns relative articles by the same author or the same tag. It excludes the current article by articleId.
	 * If there are not enough articles, the latest articles of the overview pages are returned.
	 */
	async getRelativeArticles(
		authorId: string,
		articleId: number,
		tags: string[],
		lang: string,
		numberOfArticles: number,
	): Promise<ISbStoryData<ResolvedArticle>[]> {
		const relatedArticlesResponse = await this.getRelativeArticlesByAuthorAndTags(
			authorId,
			tags,
			lang,
			articleId,
			numberOfArticles,
		);
		let result = relatedArticlesResponse.data.stories;
		if (result.length < numberOfArticles) {
			const idsToIgnore = [...result.map((s) => s.id), articleId].join(',');
			const remaining = numberOfArticles - result.length;
			const overviewArticles = await this.getOverviewArticles(lang, idsToIgnore, remaining);
			result = [...result, ...overviewArticles];
		}

		return result;
	}

	// ==================== Private Helpers ====================

	private articleByTagsFilter(tagId: string) {
		return {
			tags: {
				any_in_array: tagId,
			},
		};
	}

	private articlesByAuthorFilter(authorId: string) {
		return {
			author: {
				in: authorId,
			},
		};
	}

	private createRelativeArticlesFilter(tags: string[], authorId: string) {
		return tags && tags.length
			? {
					__or: [
						{
							author: {
								in: authorId,
							},
						},
						{
							tags: {
								in_array: tags.join(','),
							},
						},
					],
				}
			: {
					author: {
						in: authorId,
					},
				};
	}

	private async getRelativeArticlesByAuthorAndTags(
		authorId: string,
		tags: string[],
		lang: string,
		articleId: number,
		numberOfArticles: number,
	): Promise<ISbStories<ResolvedArticle>> {
		const filter = this.createRelativeArticlesFilter(tags, authorId);
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(lang)),
			per_page: numberOfArticles,
			excluding_fields: CONTENT,
			resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
			sort_by: 'first_published_at:desc',
			excluding_ids: articleId.toString(),
			content_type: StoryblokContentType.Article,
			filter_query: filter,
		};
		return getStoryblokApi().get(STORIES_PATH, params);
	}
}
