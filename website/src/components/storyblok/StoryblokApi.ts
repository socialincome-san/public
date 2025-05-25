import {
	type StoryblokArticle,
	StoryblokAuthor,
	StoryblokContentType,
	StoryblokTag,
} from '@socialincome/shared/src/storyblok/journal';
import { getStoryblokApi, ISbStory } from '@storyblok/react';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { ISbStories, ISbStoriesParams, ISbStoryData } from 'storyblok-js-client/src/interfaces';

const STANDARD_ARTICLE_RELATIONS_TO_RESOLVE = ['article.author', 'article.tags', 'article.type'];
const DEFAULT_LIMIT = 50;
const NOT_FOUND = 404;
const DEFAULT_LANGUAGE = 'en';
const CONTENT = 'content';
const STORIES_PATH = 'cdn/stories';

// During the development of Storyblok features or writing of new content, it is useful to use the draft version of the content.
async function addVersionParameter(properties: ISbStoriesParams): Promise<ISbStoriesParams> {
	return {
		...properties,
		version: (await draftMode()).isEnabled ? 'draft' : 'published',
	};
}

export async function getAuthors(lang: string): Promise<ISbStories<StoryblokAuthor>> {
	const params: ISbStoriesParams = {
		language: lang,
		content_type: StoryblokContentType.Author,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return getStoryblokApi().get(STORIES_PATH, await addVersionParameter(params));
}

export async function getTags(lang: string): Promise<ISbStories<StoryblokTag>> {
	const params: ISbStoriesParams = {
		language: lang,
		content_type: StoryblokContentType.Tag,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return getStoryblokApi().get(STORIES_PATH, await addVersionParameter(params));
}

export async function getArticlesByTag(tagId: string, lang: string): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		language: lang,
		excluding_fields: CONTENT,
		sort_by: 'first_published_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: {
			tags: {
				any_in_array: tagId,
			},
		},
	};
	return getStoryblokApi().get(STORIES_PATH, await addVersionParameter(params));
}

export async function getArticlesByAuthor(
	authorId: string,
	lang: string,
	limit = DEFAULT_LIMIT,
): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		per_page: limit,
		excluding_fields: CONTENT,
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		language: lang,
		sort_by: 'first_published_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: {
			author: {
				in: authorId,
			},
		},
	};
	return getStoryblokApi().get(STORIES_PATH, await addVersionParameter(params));
}

export async function getOverviewArticles(
	lang: string,
	idsToIgnore: string | undefined = undefined,
	limit = DEFAULT_LIMIT,
): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		per_page: limit,
		excluding_fields: CONTENT,
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		language: lang,
		sort_by: 'first_published_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
		...(idsToIgnore ? { excluding_ids: idsToIgnore } : {}),
	};
	return getStoryblokApi().get(STORIES_PATH, await addVersionParameter(params));
}

export async function getTag(slug: string, lang: string): Promise<ISbStory<StoryblokTag>> {
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<StoryblokTag>> => {
			const params: ISbStoriesParams = {
				language: lang,
			};
			return getStoryblokApi().get(`cdn/stories/tag/${slug}`, await addVersionParameter(params));
		},
		lang,
		slug,
	);
}

export async function getAuthor(slug: string, lang: string): Promise<ISbStory<StoryblokAuthor>> {
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<StoryblokAuthor>> => {
			const params: ISbStoriesParams = {
				language: lang,
			};
			return getStoryblokApi().get(`cdn/stories/author/${slug}`, await addVersionParameter(params));
		},
		lang,
		slug,
	);
}

export async function getWithFallback<T>(
	loader: (lang: string, slug: string) => Promise<T>,
	lang: string,
	slug: string,
): Promise<T> {
	try {
		return await loader(lang, slug);
	} catch (error: any) {
		if (error.status === NOT_FOUND) {
			if (lang === DEFAULT_LANGUAGE) {
				throw notFound();
			}
			return loader(DEFAULT_LANGUAGE, slug);
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
): Promise<ISbStories<StoryblokArticle>> {
	let filter = createRelativeArticlesFilter(tags, authorId);
	const params: ISbStoriesParams = {
		per_page: numberOfArticles,
		excluding_fields: CONTENT,
		resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
		language: lang,
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
): Promise<ISbStoryData<StoryblokArticle>[]> {
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
		result = [...result, ...overviewArticles.data.stories];
	}

	return result;
}

export async function getArticle(lang: string, slug: string): Promise<ISbStory<StoryblokArticle>> {
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<StoryblokArticle>> => {
			const params: ISbStoriesParams = {
				resolve_relations: STANDARD_ARTICLE_RELATIONS_TO_RESOLVE,
				language: lang,
			};
			return getStoryblokApi().get(`cdn/stories/journal/${slug}`, await addVersionParameter(params));
		},
		lang,
		slug,
	);
}
