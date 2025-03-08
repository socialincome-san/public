import { type StoryblokArticle, StoryblokAuthor, StoryblokTopic } from '@socialincome/shared/src/storyblok/journal';
import { getStoryblokApi, ISbStory } from '@storyblok/react';
import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';
import { ISbStories, ISbStoriesParams } from 'storyblok-js-client/src/interfaces';

export function getPublishedDateFormatted(date: string, lang: string) {
	const dateObject = DateTime.fromISO(date).setLocale(lang);
	return dateObject.isValid ? dateObject.toFormat('MMMM dd, yyyy') : '';
}

export async function getAuthors(lang: string): Promise<ISbStories<StoryblokAuthor>> {
	const params: ISbStoriesParams = {
		language: lang,
		content_type: 'author',
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return await getStoryblokApi().get(`cdn/stories`, params);
}

const NOT_FOUND = 404;

const DEFAULT_LANGUAGE = 'en';

async function loadArticle(lang: string, slug: string[]): Promise<ISbStory<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		version: 'draft',
		resolve_relations: ['article.author', 'article.topics'],
		language: lang,
	};
	return await getStoryblokApi().get(`cdn/stories/journal/${slug?.join('/')}`, params);
}

export async function loadTopics(lang: string): Promise<ISbStories<StoryblokTopic>> {
	const params: ISbStoriesParams = {
		language: lang,

		content_type: 'topic',
	};
	return await getStoryblokApi().get(`cdn/stories`, params);
}

export async function loadOverviewBlogs(lang: string): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		resolve_relations: ['article.author', 'article.topics'],
		language: lang,
		sort_by: 'created_at:desc',
		content_type: 'article',
		filter_query: {
			displayInOverviewPage: {
				is: true,
			},
		},
	};
	return await getStoryblokApi().get(`cdn/stories`, params);
}

export async function loadArticleWithFallbackToDefaultLanguage(
	lang: string,
	slug: string[],
): Promise<ISbStory<StoryblokArticle>> {
	try {
		return await loadArticle(lang, slug);
	} catch (error: any) {
		if (error.status === NOT_FOUND) {
			if (lang === DEFAULT_LANGUAGE) {
				throw notFound();
			}
			return await loadArticle(DEFAULT_LANGUAGE, slug);
		}
		throw error;
	}
}
