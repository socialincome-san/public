import {
	formatStoryblokDateToIso,
	formatStoryblokUrl,
	getDimensionsFromStoryblokImageUrl,
} from '@/components/legacy/storyblok/StoryblokUtils';
import type { Article, ArticleType, Author, Topic } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage, WebsiteLanguage } from '@/lib/i18n/utils';
import { getStoryblokApi } from '@/lib/storyblok';
import type { ISbStories, ISbStoriesParams, ISbStory, ISbStoryData } from '@storyblok/js';
import { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

// Helper type to remove index signature from a type
type RemoveIndexSignature<T> = {
	[K in keyof T as string extends K ? never : K]: T[K];
};

// Type for articles with resolved relations (used when resolve_relations is applied, line 32)
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
const NOT_FOUND = 404;
const CONTENT = 'content';
const LEAD_TEXT = 'leadText';
const STORIES_PATH = 'cdn/stories';
const EXCLUDED_FIELDS_FOR_COUNTING = [CONTENT, LEAD_TEXT].join(',');

// During the development of Storyblok features or writing of new content, it is useful to use the draft version of the content.
async function addVersionParameter(properties: ISbStoriesParams): Promise<ISbStoriesParams> {
	return {
		...properties,
		version: (await draftMode()).isEnabled ? 'draft' : 'published',
	};
}

// To the best of my knowledge Storyblok doesn't support any aggregation functions API, therefore we are querying all of them
// with a limit of 1 article per page. Therefore, the response doesn't transfer much not needed data but still contains the count
export async function getOverviewArticlesCountForDefaultLang(): Promise<number> {
	const params: ISbStoriesParams = {
		per_page: 1,
		excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
		language: defaultLanguage,
		content_type: StoryblokContentType.Article,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return (await getStoryblokApi().get(STORIES_PATH, await addVersionParameter(params))).total;
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
		per_page: 1,
		language: defaultLanguage,
		excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
		content_type: StoryblokContentType.Article,
		filter_query: articleByTagsFilter(tagId),
	};
	return (await getStoryblokApi().get(STORIES_PATH, await addVersionParameter(params))).total;
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
		per_page: 1,
		excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
		language: defaultLanguage,
		content_type: StoryblokContentType.Article,
		filter_query: articlesByAuthorFilter(authorId),
	};
	return (await getStoryblokApi().get(STORIES_PATH, await addVersionParameter(params))).total;
}

export async function getOverviewAuthors(lang: string): Promise<ISbStoryData<Author>[]> {
	const params: ISbStoriesParams = {
		language: lang as WebsiteLanguage,
		content_type: StoryblokContentType.Author,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return getStoryblokApi().getAll(STORIES_PATH, await addVersionParameter(params));
}

export async function getOverviewTags(lang: string): Promise<ISbStoryData<Topic>[]> {
	const params: ISbStoriesParams = {
		language: lang as WebsiteLanguage,
		content_type: StoryblokContentType.Tag,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return getStoryblokApi().getAll(STORIES_PATH, await addVersionParameter(params));
}

export async function getArticlesByTag(tagId: string, lang: string): Promise<ISbStoryData<ResolvedArticle>[]> {
	const params: ISbStoriesParams = {
		per_page: DEFAULT_PAGE_SIZE,
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		language: lang as WebsiteLanguage,
		excluding_fields: CONTENT,
		sort_by: 'first_published_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: articleByTagsFilter(tagId),
	};
	return getStoryblokApi().getAll(STORIES_PATH, await addVersionParameter(params));
}

export async function getArticlesByAuthor(authorId: string, lang: string): Promise<ISbStoryData<ResolvedArticle>[]> {
	const params: ISbStoriesParams = {
		per_page: DEFAULT_PAGE_SIZE,
		excluding_fields: CONTENT,
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		language: lang as WebsiteLanguage,
		sort_by: 'first_published_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: articlesByAuthorFilter(authorId),
	};
	return getStoryblokApi().getAll(STORIES_PATH, await addVersionParameter(params));
}

export async function getOverviewArticles(
	lang: string,
	idsToIgnore: string | undefined = undefined,
	limit: number | undefined = undefined,
): Promise<ISbStoryData<ResolvedArticle>[]> {
	const params: ISbStoriesParams = {
		per_page: limit || DEFAULT_PAGE_SIZE,
		excluding_fields: CONTENT,
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		language: lang as WebsiteLanguage,
		sort_by: 'first_published_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
		...(idsToIgnore ? { excluding_ids: idsToIgnore } : {}),
	};
	const parameters = await addVersionParameter(params);
	if (limit) {
		return (await getStoryblokApi().get(STORIES_PATH, parameters)).data.stories;
	} else {
		return getStoryblokApi().getAll(STORIES_PATH, parameters);
	}
}

export async function getTag(slug: string, lang: string): Promise<ISbStory<Topic>> {
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<Topic>> => {
			const params: ISbStoriesParams = {
				language: lang as WebsiteLanguage,
			};
			return getStoryblokApi().get(`cdn/stories/tag/${slug}`, await addVersionParameter(params));
		},
		lang,
		slug,
	);
}

export async function getAuthor(slug: string, lang: string): Promise<ISbStory<Author>> {
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<Author>> => {
			const params: ISbStoriesParams = {
				language: lang as WebsiteLanguage,
			};
			return getStoryblokApi().get(`cdn/stories/author/${slug}`, await addVersionParameter(params));
		},
		lang,
		slug,
	);
}

async function getWithFallback<T>(
	loader: (lang: string, slug: string) => Promise<T>,
	lang: string,
	slug: string,
): Promise<T> {
	try {
		return await loader(lang, slug);
	} catch (error: any) {
		if (error?.status === NOT_FOUND) {
			if (lang === defaultLanguage) {
				return notFound();
			}
			return await getWithFallback(loader, defaultLanguage, slug);
		}
		throw error;
	}
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
	let filter = createRelativeArticlesFilter(tags, authorId);
	const params: ISbStoriesParams = {
		per_page: numberOfArticles,
		excluding_fields: CONTENT,
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		language: lang as WebsiteLanguage,
		sort_by: 'first_published_at:desc',
		excluding_ids: articleId.toString(),
		content_type: StoryblokContentType.Article,
		filter_query: filter,
	};
	return getStoryblokApi().get(STORIES_PATH, await addVersionParameter(params));
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
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<ResolvedArticle>> => {
			const params: ISbStoriesParams = {
				resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
				language: lang as WebsiteLanguage,
			};
			return getStoryblokApi().get(`cdn/stories/journal/${slug}`, await addVersionParameter(params));
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
