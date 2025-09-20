import { getAuthors, getOverviewArticles, getTags } from '@/components/storyblok/StoryblokApi';
import { toDateObject } from '@/components/storyblok/StoryblokUtils';
import { defaultLanguage } from '@/lib/i18n/utils';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { type StoryblokArticle, StoryblokAuthor, StoryblokTag } from '@/types/journal';
import fs from 'fs';
import type { MetadataRoute } from 'next';
import path from 'path';
import { ISbStories } from 'storyblok-js-client/src/interfaces';

const url = 'https://socialincome.org';
storyblokInitializationWorkaround();

// To the best of my knowledge, there is no OOTB way to get all nextjs static paths
function getStaticRoutes(startPath: string): string[] {
	const routes: string[] = [];
	const excludedPrefixes = ['_', '(', '['];
	function traverse(currentPath: string, currentRoute = '') {
		const directoryEntries = fs.readdirSync(currentPath, { withFileTypes: true });

		for (const directoryEntry of directoryEntries) {
			const fullPath = path.join(currentPath, directoryEntry.name);
			if (!excludedPrefixes.some((char) => directoryEntry.name.startsWith(char))) {
				if (directoryEntry.isDirectory()) {
					traverse(fullPath, `${currentRoute}/${directoryEntry.name}`);
				} else if (
					(directoryEntry.isFile() && directoryEntry.name === 'page.tsx') ||
					directoryEntry.name === 'page.ts'
				) {
					const route = `${currentRoute}/${directoryEntry.name.replace(/page\.(tsx|ts)$/, '')}`
						.replace(/^\//, '')
						.replace(/\/+$/, '');
					routes.push(route);
				}
			}
		}
	}
	traverse(startPath);
	return routes;
}

const WEBSITE_LOCAL_PATH = 'src/app/[lang]/[region]/(website)';
const STATIC_ROUTES = getStaticRoutes(WEBSITE_LOCAL_PATH);
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

function generateStoryblokArticlesSitemap(blogsResponse: ISbStories<StoryblokArticle>): MetadataRoute.Sitemap {
	return blogsResponse.data.stories.map((article) => ({
		url: articleUrl(article.slug, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, articleUrl(article.slug, lang)])),
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
	return STATIC_ROUTES.map((route) => ({
		url: staticPageUrl(route, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, staticPageUrl(route, lang)])),
		},
	}));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [blogsResponse, authorsResponse, tagsResponse] = await Promise.all([
		getOverviewArticles(defaultLanguage),
		getAuthors(defaultLanguage),
		getTags(defaultLanguage),
	]);
	const result : MetadataRoute.Sitemap = [];
	return result.concat(
		generateStaticPagesSitemap(),
		generateStoryblokArticlesSitemap(blogsResponse),
		generateStoryblokAuthorsSitemap(authorsResponse),
		generateStoryblokTagSitemap(tagsResponse),
	);
}
