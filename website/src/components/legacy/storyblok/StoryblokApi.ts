import {
  formatStoryblokDateToIso,
  formatStoryblokUrl,
  getDimensionsFromStoryblokImageUrl,
} from '@/components/legacy/storyblok/StoryblokUtils';
import type { Article, ArticleType, Author, Topic } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage } from '@/lib/i18n/utils';
import { getStoryblokApi, getStoryParams, withLanguageFallback } from '@/lib/storyblok';
import type { ISbStories, ISbStoriesParams, ISbStory, ISbStoryData } from '@storyblok/js';
import { Metadata } from 'next';

// Helper type to remove index signature from a type
type RemoveIndexSignature<T> = {
	[K in keyof T as string extends K ? never : K]: T[K];
};

export type ResolvedArticle = Omit<RemoveIndexSignature<Article>, 'author' | 'type' | 'tags'> & {
	author: ISbStoryData<Author>;
	type: ISbStoryData<ArticleType>;
	tags?: ISbStoryData<Topic>[];
};

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

// To the best of my knowledge Storyblok doesn't support any aggregation functions API, therefore we are querying all of them
// with a limit of 1 article per page. Therefore, the response doesn't transfer much not needed data but still contains the count
export async function getOverviewArticlesCountForDefaultLang(): Promise<number> {
	const params: ISbStoriesParams = {
		...(await getStoryParams(defaultLanguage)),
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

function articleByTagsFilter(tagId: string) {
	return {
		tags: {
			any_in_array: tagId,
		},
	};
}

// To the best of my knowledge Storyblok doesn't support any aggregation functions API, therefore we are querying all of them
// with a limit of 1 article per page. Therefore, the response doesn't transfer much not needed data but still contains the count
export async function getArticleCountByTagForDefaultLang(tagId: string): Promise<number> {
	const params: ISbStoriesParams = {
		...(await getStoryParams(defaultLanguage)),
		per_page: 1,
		excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
		content_type: StoryblokContentType.Article,
		filter_query: articleByTagsFilter(tagId),
	};
	return (await getStoryblokApi().get(STORIES_PATH, params)).total;
}

function articlesByAuthorFilter(authorId: string) {
	return {
		author: {
			in: authorId,
		},
	};
}

// To the best of my knowledge Storyblok doesn't support any aggregation functions API, therefore we are querying all of them
// with a limit of 1 article per page. Therefore, the response doesn't transfer much not needed data but still contains the count
export async function getArticleCountByAuthorForDefaultLang(authorId: string): Promise<number> {
	const params: ISbStoriesParams = {
		...(await getStoryParams(defaultLanguage)),
		per_page: 1,
		excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
		content_type: StoryblokContentType.Article,
		filter_query: articlesByAuthorFilter(authorId),
	};
	return (await getStoryblokApi().get(STORIES_PATH, params)).total;
}

export async function getOverviewAuthors(lang: string): Promise<ISbStoryData<Author>[]> {
	const params: ISbStoriesParams = {
		...(await getStoryParams(lang)),
		content_type: StoryblokContentType.Author,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return getStoryblokApi().getAll(STORIES_PATH, params);
}

export async function getOverviewTags(lang: string): Promise<ISbStoryData<Topic>[]> {
	const params: ISbStoriesParams = {
		...(await getStoryParams(lang)),
		content_type: StoryblokContentType.Tag,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return getStoryblokApi().getAll(STORIES_PATH, params);
}

export async function getArticlesByTag(tagId: string, lang: string): Promise<ISbStoryData<ResolvedArticle>[]> {
	const params: ISbStoriesParams = {
		...(await getStoryParams(lang)),
		per_page: DEFAULT_PAGE_SIZE,
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		excluding_fields: CONTENT,
		sort_by: 'first_published_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: articleByTagsFilter(tagId),
	};
	return getStoryblokApi().getAll(STORIES_PATH, params);
}

export async function getArticlesByAuthor(authorId: string, lang: string): Promise<ISbStoryData<ResolvedArticle>[]> {
	const params: ISbStoriesParams = {
		...(await getStoryParams(lang)),
		per_page: DEFAULT_PAGE_SIZE,
		excluding_fields: CONTENT,
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		sort_by: 'first_published_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: articlesByAuthorFilter(authorId),
	};
	return getStoryblokApi().getAll(STORIES_PATH, params);
}

export async function getOverviewArticles(
	lang: string,
	idsToIgnore: string | undefined = undefined,
	limit: number | undefined = undefined,
): Promise<ISbStoryData<ResolvedArticle>[]> {
	const params: ISbStoriesParams = {
		...(await getStoryParams(lang)),
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

export async function getTag(slug: string, lang: string): Promise<ISbStory<Topic>> {
	return withLanguageFallback(
		async (lang: string, slug: string): Promise<ISbStory<Topic>> => {
			return getStoryblokApi().get(`cdn/stories/tag/${slug}`, await getStoryParams(lang));
		},
		lang,
		slug,
	);
}

export async function getAuthor(slug: string, lang: string): Promise<ISbStory<Author>> {
	return withLanguageFallback(
		async (lang: string, slug: string): Promise<ISbStory<Author>> => {
			return getStoryblokApi().get(`cdn/stories/author/${slug}`, await getStoryParams(lang));
		},
		lang,
		slug,
	);
}

function createRelativeArticlesFilter(tags: string[], authorId: string) {
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

async function getRelativeArticlesByAuthorAndTags(
	authorId: string,
	tags: string[],
	lang: string,
	articleId: number,
	numberOfArticles: number,
): Promise<ISbStories<ResolvedArticle>> {
	const filter = createRelativeArticlesFilter(tags, authorId);
	const params: ISbStoriesParams = {
		...(await getStoryParams(lang)),
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

/*
 * Returns relative articles by the same author or the same tag. It excludes the current article by {articleId}.
 * If there are not enough articles, the latest articles of the overview pages are returned.
 * */
export async function getRelativeArticles(
	authorId: string,
	articleId: number,
	tags: string[],
	lang: string,
	numberOfArticles: number,
): Promise<ISbStoryData<ResolvedArticle>[]> {
	const relatedArticlesResponse = await getRelativeArticlesByAuthorAndTags(
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
		const overviewArticles = await getOverviewArticles(lang, idsToIgnore, remaining);
		result = [...result, ...overviewArticles];
	}

	return result;
}

export async function getArticle(lang: string, slug: string): Promise<ISbStory<ResolvedArticle>> {
	return withLanguageFallback(
		async (lang: string, slug: string): Promise<ISbStory<ResolvedArticle>> => {
			const params: ISbStoriesParams = {
				...(await getStoryParams(lang)),
				resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
			};
			return getStoryblokApi().get(`cdn/stories/journal/${slug}`, params);
		},
		lang,
		slug,
	);
}

export function generateMetaDataForArticle(storyblokStory: ISbStoryData<ResolvedArticle>, url: string): Metadata {
	const storyblokArticle = storyblokStory.content;
	const title = storyblokArticle.title;
	const description = storyblokArticle.leadText;
	const authorsFullName = `${storyblokArticle.author.content.firstName} ${storyblokArticle.author.content.lastName}`;
	const imageFilename = storyblokArticle.image?.filename;
	const tags = storyblokArticle.tags?.map((it) => it.content.value).join(', ');

	let imageMetaData: { url: string; width?: number; height?: number } | undefined;
	if (imageFilename) {
		const dimensions = getDimensionsFromStoryblokImageUrl(imageFilename);
		if (dimensions.width && dimensions.height) {
			const imageUrl = formatStoryblokUrl(
				imageFilename,
				dimensions.width,
				dimensions.height,
				storyblokArticle.image.focus ?? undefined,
			);
			imageMetaData = {
				url: imageUrl,
				width: dimensions.width,
				height: dimensions.height,
			};
		}
	}

	return {
		title: title,
		description: description,
		keywords: tags,
		authors: { name: authorsFullName },
		openGraph: {
			title: title,
			description: description,
			images: imageMetaData,
			url: url,
			type: 'article',
		},
		twitter: {
			title: title,
			description: description,
			images: imageMetaData,
			card: 'summary_large_image',
			site: '@so_income',
			creator: '@so_income',
		},
		other: {
			'article:published_time': formatStoryblokDateToIso(storyblokStory.first_published_at),
			'article:modified_time': formatStoryblokDateToIso(storyblokStory.updated_at),
			'article:author': authorsFullName,
			'article:section': 'News',
			...(tags && { 'article:tag': tags }),
		},
	};
}
