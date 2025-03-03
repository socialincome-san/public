import {
	type StoryblokArticle,
	StoryblokAuthor,
	StoryblokContentType,
	StoryblokTag,
} from '@socialincome/shared/src/storyblok/journal';
import { getStoryblokApi, ISbStory } from '@storyblok/react';
import { DateTime } from 'luxon';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { ISbStories, ISbStoriesParams, ISbStoryData } from 'storyblok-js-client/src/interfaces';

const STANDARD_RELATIONS_TO_RESOLVE = ['article.author', 'article.tags', 'article.type'];
const DEFAULT_LIMIT = 50;
const NOT_FOUND = 404;
const DEFAULT_LANGUAGE = 'en';
const CONTENT = 'content';
const STORIES_PATH = 'cdn/stories';

export function getPublishedDateFormatted(date: string, lang: string) {
	const dateObject = DateTime.fromISO(date).setLocale(lang);
	return dateObject.isValid ? dateObject.toFormat('MMMM dd, yyyy') : '';
}

// During the development of Storyblok features or writing of new content, it is useful to use the draft version of the content.
function addVersionParameter(properties: ISbStoriesParams): ISbStoriesParams {
	return { ...properties, version: draftMode().isEnabled ? 'draft' : 'published' };
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
	return getStoryblokApi().get(STORIES_PATH, addVersionParameter(params));
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
	return getStoryblokApi().get(STORIES_PATH, addVersionParameter(params));
}

export async function getArticlesByTag(tagId: string, lang: string): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		resolve_relations: STANDARD_RELATIONS_TO_RESOLVE,
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
	return getStoryblokApi().get(STORIES_PATH, addVersionParameter(params));
}

export async function getArticlesByAuthor(
	authorId: string,
	lang: string,
	limit = DEFAULT_LIMIT,
): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		per_page: limit,
		excluding_fields: CONTENT,
		resolve_relations: STANDARD_RELATIONS_TO_RESOLVE,
		language: lang,
		sort_by: 'first_published_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: {
			author: {
				in: authorId,
			},
		},
	};
	return getStoryblokApi().get(STORIES_PATH, addVersionParameter(params));
}

export async function getOverviewArticles(
	lang: string,
	idsToIgnore: string | undefined = undefined,
	limit = DEFAULT_LIMIT,
): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		per_page: limit,
		excluding_fields: CONTENT,
		resolve_relations: STANDARD_RELATIONS_TO_RESOLVE,
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
	return getStoryblokApi().get(STORIES_PATH, addVersionParameter(params));
}

export async function getTag(slug: string, lang: string): Promise<ISbStory<StoryblokTag>> {
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<StoryblokTag>> => {
			const params: ISbStoriesParams = {
				language: lang,
			};
			return getStoryblokApi().get(`cdn/stories/tag/${slug}`, addVersionParameter(params));
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
			return getStoryblokApi().get(`cdn/stories/author/${slug}`, addVersionParameter(params));
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
		return loader(lang, slug);
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
	return !!tags
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
		resolve_relations: STANDARD_RELATIONS_TO_RESOLVE,
		language: lang,
		sort_by: 'first_published_at:desc',
		excluding_ids: articleId.toString(),
		content_type: StoryblokContentType.Article,
		filter_query: filter,
	};
	return getStoryblokApi().get(STORIES_PATH, addVersionParameter(params));
}

export async function getRelativeArticles(
	authorId: string,
	articleId: number,
	tags: string[],
	lang: string,
	numberOfArticles: number,
): Promise<ISbStoryData<StoryblokArticle>[]> {
	const related = await getRelativeArticlesByAuthorAndTags(authorId, tags, lang, articleId, numberOfArticles);
	let stories = related.data.stories;

	if (stories.length < numberOfArticles) {
		const idsToIgnore = [...stories.map((s) => s.id), articleId].join(',');
		const remaining = numberOfArticles - stories.length;
		const extra = await getOverviewArticles(lang, idsToIgnore, remaining);
		stories = [...stories, ...extra.data.stories];
	}

	return stories;
}

export async function getArticle(lang: string, slug: string): Promise<ISbStory<StoryblokArticle>> {
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<StoryblokArticle>> => {
			const params: ISbStoriesParams = {
				resolve_relations: STANDARD_RELATIONS_TO_RESOLVE,
				language: lang,
			};
			return getStoryblokApi().get(`cdn/stories/journal/${slug}`, addVersionParameter(params));
		},
		lang,
		slug,
	);
}
