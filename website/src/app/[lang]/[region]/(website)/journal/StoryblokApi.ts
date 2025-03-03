import { type StoryblokArticle, StoryblokAuthor } from '@socialincome/shared/src/storyblok/journal';
import { getStoryblokApi, ISbStory } from '@storyblok/react';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { ISbStories, ISbStoriesParams } from 'storyblok-js-client/src/interfaces';

export async function getAuthors(lang: string): Promise<ISbStories<StoryblokAuthor>> {
	const params: ISbStoriesParams = {
		language: lang,
		content_type: 'author',
	};
	return await getStoryblokApi().get(`cdn/stories`, params);
}

const NOT_FOUND = 404;

const DEFAULT_LANGUAGE = 'en';

async function loadArticle(lang: string, slug: string[]): Promise<ISbStory<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		...(draftMode().isEnabled ? { version: 'draft' } : {}),
		resolve_relations: ['article.author', 'article.topics'],
		language: lang,
	};
	return await getStoryblokApi().get(`cdn/stories/journal/${slug?.join('/')}`, params);
}

export async function loadOverviewBlogs(lang: string): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		resolve_relations: ['article.author', 'article.topics'],
		language: lang,
		with_tag: 'overview',
		sort_by: 'created_at:desc',
		content_type: 'article',
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
