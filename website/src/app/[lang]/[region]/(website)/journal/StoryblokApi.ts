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
import { ISbStories, ISbStoriesParams } from 'storyblok-js-client/src/interfaces';

const standardRelationsToResolve = ['article.author', 'article.tags', 'article.type'];

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
	return await getStoryblokApi().get(`cdn/stories`, addVersionParameter(params));
}

const NOT_FOUND = 404;

const DEFAULT_LANGUAGE = 'en';

export async function getTags(lang: string): Promise<ISbStories<StoryblokTag>> {
	const params: ISbStoriesParams = {
		language: lang,
		content_type: StoryblokContentType.Tag,
	};
	return await getStoryblokApi().get(`cdn/stories`, addVersionParameter(params));
}

export async function getArticlesByTag(tagId: string, lang: string): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		resolve_relations: standardRelationsToResolve,
		language: lang,
		sort_by: 'created_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: {
			tags: {
				any_in_array: tagId,
			},
		},
	};
	return await getStoryblokApi().get(`cdn/stories`, addVersionParameter(params));
}

export async function getArticlesByAuthor(authorId: string, lang: string): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		resolve_relations: standardRelationsToResolve,
		language: lang,
		sort_by: 'created_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: {
			author: {
				in: authorId,
			},
		},
	};
	return await getStoryblokApi().get(`cdn/stories`, addVersionParameter(params));
}

export async function getOverviewArticles(lang: string): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		resolve_relations: standardRelationsToResolve,
		language: lang,
		sort_by: 'created_at:desc',
		content_type: StoryblokContentType.Article,
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return await getStoryblokApi().get(`cdn/stories`, addVersionParameter(params));
}

export async function getTag(slug: string, lang: string): Promise<ISbStory<StoryblokTag>> {
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<StoryblokTag>> => {
			const params: ISbStoriesParams = {
				language: lang,
			};
			return await getStoryblokApi().get(`cdn/stories/tag/${slug}`, addVersionParameter(params));
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
			return await getStoryblokApi().get(`cdn/stories/author/${slug}`, addVersionParameter(params));
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
			return await loader(DEFAULT_LANGUAGE, slug);
		}
		throw error;
	}
}

export async function getArticle(lang: string, slug: string): Promise<ISbStory<StoryblokArticle>> {
	return getWithFallback(
		async (lang: string, slug: string): Promise<ISbStory<StoryblokArticle>> => {
			const params: ISbStoriesParams = {
				resolve_relations: standardRelationsToResolve,
				language: lang,
			};
			return await getStoryblokApi().get(`cdn/stories/journal/${slug}`, addVersionParameter(params));
		},
		lang,
		slug,
	);
}
