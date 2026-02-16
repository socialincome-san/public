import type { Author, Topic } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage } from '@/lib/i18n/utils';
import { ServiceResult } from '@/lib/services/core/base.types';
import type { ISbStories, ISbStoriesParams, ISbStoryData } from '@storyblok/js';
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
	async getStoryParams(language: string): Promise<ISbStoriesParams> {
		return {
			language,
			version: (await draftMode()).isEnabled ? 'draft' : 'published',
		};
	}

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

	async getStoryWithFallback<T>(slug: string, lang: string): Promise<ServiceResult<T>> {
		try {
			const data = await this.withLanguageFallback(
				async (language: string) => {
					const response = await getStoryblokApi().get(`cdn/stories/${slug}`, await this.getStoryParams(language));
					return response.data.story as T;
				},
				lang,
				slug,
			);
			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to fetch story: ${JSON.stringify(error)}`);
		}
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

	async getArticleCountByTagForDefaultLang(tagId: string): Promise<ServiceResult<number>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(defaultLanguage)),
				per_page: 1,
				excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
				content_type: StoryblokContentType.Article,
				filter_query: this.articleByTagsFilter(tagId),
			};
			const res = await getStoryblokApi().get(STORIES_PATH, params);
			return this.resultOk(res.total);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to count articles by tag: ${JSON.stringify(error)}`);
		}
	}

	async getArticleCountByAuthorForDefaultLang(authorId: string): Promise<ServiceResult<number>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(defaultLanguage)),
				per_page: 1,
				excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
				content_type: StoryblokContentType.Article,
				filter_query: this.articlesByAuthorFilter(authorId),
			};
			const res = await getStoryblokApi().get(STORIES_PATH, params);
			return this.resultOk(res.total);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to count articles by author: ${JSON.stringify(error)}`);
		}
	}

	async getOverviewAuthors(lang: string): Promise<ServiceResult<ISbStoryData<Author>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				content_type: StoryblokContentType.Author,
				filter_query: { displayInOverviewPage: { is: true } },
			};
			const data = await getStoryblokApi().getAll(STORIES_PATH, params);
			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);
			return this.resultOk([]);
		}
	}

	async getOverviewTags(lang: string): Promise<ServiceResult<ISbStoryData<Topic>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				content_type: StoryblokContentType.Tag,
				filter_query: { displayInOverviewPage: { is: true } },
			};
			const data = await getStoryblokApi().getAll(STORIES_PATH, params);
			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);
			return this.resultOk([]);
		}
	}

	async getTag(slug: string, lang: string): Promise<ServiceResult<ISbStoryData<Topic>>> {
		try {
			const res = await this.withLanguageFallback(
				async (l, s) => getStoryblokApi().get(`cdn/stories/tag/${s}`, await this.getStoryParams(l)),
				lang,
				slug,
			);
			return this.resultOk(res.data.story);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to fetch tag: ${JSON.stringify(error)}`);
		}
	}

	async getAuthor(slug: string, lang: string): Promise<ServiceResult<ISbStoryData<Author>>> {
		try {
			const res = await this.withLanguageFallback(
				async (l, s) => getStoryblokApi().get(`cdn/stories/author/${s}`, await this.getStoryParams(l)),
				lang,
				slug,
			);
			return this.resultOk(res.data.story);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to fetch author: ${JSON.stringify(error)}`);
		}
	}

	async getArticlesByTag(tagId: string, lang: string): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				per_page: DEFAULT_PAGE_SIZE,
				resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
				excluding_fields: CONTENT,
				sort_by: 'first_published_at:desc',
				content_type: StoryblokContentType.Article,
				filter_query: this.articleByTagsFilter(tagId),
			};
			const data = await getStoryblokApi().getAll(STORIES_PATH, params);
			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);
			return this.resultOk([]);
		}
	}

	async getArticlesByAuthor(authorId: string, lang: string): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				per_page: DEFAULT_PAGE_SIZE,
				excluding_fields: CONTENT,
				resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
				sort_by: 'first_published_at:desc',
				content_type: StoryblokContentType.Article,
				filter_query: this.articlesByAuthorFilter(authorId),
			};
			const data = await getStoryblokApi().getAll(STORIES_PATH, params);
			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);
			return this.resultOk([]);
		}
	}

	async getOverviewArticles(
		lang: string,
		idsToIgnore?: string,
		limit?: number,
	): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				per_page: limit || DEFAULT_PAGE_SIZE,
				excluding_fields: CONTENT,
				resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
				sort_by: 'first_published_at:desc',
				content_type: StoryblokContentType.Article,
				filter_query: { displayInOverviewPage: { is: true } },
				...(idsToIgnore ? { excluding_ids: idsToIgnore } : {}),
			};

			if (limit) {
				const res = await getStoryblokApi().get(STORIES_PATH, params);
				return this.resultOk(res.data.stories);
			}

			const data = await getStoryblokApi().getAll(STORIES_PATH, params);
			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);
			return this.resultOk([]);
		}
	}

	async getArticle(lang: string, slug: string): Promise<ServiceResult<ISbStoryData<ResolvedArticle>>> {
		try {
			const res = await this.withLanguageFallback(
				async (l, s) => {
					const params: ISbStoriesParams = {
						...(await this.getStoryParams(l)),
						resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
					};
					return getStoryblokApi().get(`cdn/stories/journal/${s}`, params);
				},
				lang,
				slug,
			);
			return this.resultOk(res.data.story);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to fetch article: ${JSON.stringify(error)}`);
		}
	}

	async getRelativeArticles(
		authorId: string,
		articleId: number,
		tags: string[],
		lang: string,
		numberOfArticles: number,
	): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> {
		try {
			const related = await this.getRelativeArticlesByAuthorAndTags(authorId, tags, lang, articleId, numberOfArticles);
			let result = related.data.stories;

			if (result.length < numberOfArticles) {
				const idsToIgnore = [...result.map((s) => s.id), articleId].join(',');
				const remaining = numberOfArticles - result.length;
				const overview = await this.getOverviewArticles(lang, idsToIgnore, remaining);
				if (overview.success) result = [...result, ...overview.data];
			}

			return this.resultOk(result);
		} catch (error) {
			this.logger.error(error);
			return this.resultOk([]);
		}
	}

	private articleByTagsFilter(tagId: string) {
		return { tags: { any_in_array: tagId } };
	}

	private articlesByAuthorFilter(authorId: string) {
		return { author: { in: authorId } };
	}

	private createRelativeArticlesFilter(tags: string[], authorId: string) {
		return tags && tags.length
			? { __or: [{ author: { in: authorId } }, { tags: { in_array: tags.join(',') } }] }
			: { author: { in: authorId } };
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
