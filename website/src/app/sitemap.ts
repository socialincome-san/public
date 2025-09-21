import { getAuthors, getOverviewArticles, getTags } from '@/components/storyblok/StoryblokApi';
import { toDateObject } from '@/components/storyblok/StoryblokUtils';
import { defaultLanguage } from '@/lib/i18n/utils';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { type StoryblokArticle, StoryblokAuthor, StoryblokTag } from '@/types/journal';
import fs from 'fs';
import type { MetadataRoute } from 'next';
import { ISbStories } from 'storyblok-js-client/src/interfaces';

export const revalidate = 86400; // per day
const url = 'https://socialincome.org';
storyblokInitializationWorkaround();

const SUPPORTED_LANGUAGES = ['de', 'fr', 'it'];

function articleUrl(slug: string, lang: string) {
	return `${url}/${lang}/journal/${slug}`;
}

function tagUrl(slug: string, lang: string) {
	return `${url}/${lang}/journal/tag/${slug}`;
}

function authorUrl(slug: string, lang: string) {
	return `${url}/${lang}/journal/author/${slug}`;
}

function generateAlternativeLanguages(alternativeArticles: Record<string, string[]>, slug: string) {
	return Object.fromEntries(
		SUPPORTED_LANGUAGES.filter((lang) => alternativeArticles[lang].includes(slug)).map((lang) => [
			lang,
			articleUrl(slug, lang),
		]),
	);
}

function generateStoryblokArticlesSitemap(
	blogsResponse: ISbStories<StoryblokArticle>,
	blogsAlternativeLanguages: { lang: string; stories: ISbStories<StoryblokArticle> }[],
): MetadataRoute.Sitemap {
	const alternativeArticles = Object.fromEntries(
		blogsAlternativeLanguages.map(({ lang, stories }) => [lang, stories.data.stories.map((it) => it.slug)]),
	) as Record<string, string[]>;
	return blogsResponse.data.stories.map((article) => ({
		url: articleUrl(article.slug, defaultLanguage),
		alternates: {
			languages: generateAlternativeLanguages(alternativeArticles, article.slug),
		},
		changeFrequency: 'monthly',
		lastModified: toDateObject(article.updated_at!, defaultLanguage).toString(),
	}));
}

function generateStoryblokAuthorsSitemap(authorsResponse: ISbStories<StoryblokAuthor>): MetadataRoute.Sitemap {
	return authorsResponse.data.stories.map((author) => ({
		url: authorUrl(author.slug, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, authorUrl(author.slug, lang)])),
		},
		changeFrequency: 'weekly',
	}));
}

function generateStoryblokTagSitemap(tagsResponse: ISbStories<StoryblokTag>): MetadataRoute.Sitemap {
	return tagsResponse.data.stories.map((tag) => ({
		url: tagUrl(tag.slug, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, tagUrl(tag.slug, lang)])),
		},
		changeFrequency: 'weekly',
	}));
}

function staticPageUrl(route: string, lang: string) {
	return `${url}/${lang}/${route}`;
}

function generateStaticPagesSitemap(): MetadataRoute.Sitemap {
	const file = fs.readFileSync('src/app/static-pages.json').toString();
	const staticRoutes: string[] = JSON.parse(file);
	return staticRoutes.map((route) => ({
		url: staticPageUrl(route, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, staticPageUrl(route, lang)])),
		},
	}));
}

function getBlogsInAlternativeLanguagesPromise() {
	return Promise.all(
		SUPPORTED_LANGUAGES.map(async (lang) => ({
			lang,
			stories: await getOverviewArticles(lang),
		})),
	);
}

const STATIC_SITEMAP = generateStaticPagesSitemap();
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	try {
		const [blogsResponse, blogsAlternativeLanguages, authorsResponse, tagsResponse] = await Promise.all([
			getOverviewArticles(defaultLanguage),
			getBlogsInAlternativeLanguagesPromise(),
			getAuthors(defaultLanguage),
			getTags(defaultLanguage),
		]);
		return STATIC_SITEMAP.concat(
			generateStoryblokArticlesSitemap(blogsResponse, blogsAlternativeLanguages),
			generateStoryblokAuthorsSitemap(authorsResponse),
			generateStoryblokTagSitemap(tagsResponse),
		);
	} catch (error) {
		console.error('Failed to generate full sitemap', error);
		return STATIC_SITEMAP;
	}
}
