import {
	getOverviewArticles,
	getOverviewArticleTypes,
	getOverviewAuthors,
	getOverviewTags
} from '@/components/legacy/storyblok/StoryblokApi';
import { toDateObject } from '@/components/legacy/storyblok/StoryblokUtils';
import { defaultLanguage, defaultRegion, WebsiteLanguage, WebsiteRegion, websiteRegions } from '@/lib/i18n/utils';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { type StoryblokArticle, StoryblokArticleType, StoryblokAuthor, StoryblokTag } from '@/types/journal';
import type { MetadataRoute } from 'next';
import { ISbStoryData } from 'storyblok-js-client/src/interfaces';
import staticRoutes from './static-pages.json';

export const revalidate = 86400; // per day
const url = 'https://socialincome.org';
storyblokInitializationWorkaround();

const SUPPORTED_LANGUAGES: WebsiteLanguage[] = ['de', 'fr', 'it'];

function articleUrl(slug: string, lang: WebsiteLanguage, region: WebsiteRegion = defaultRegion) {
	return `${url}/${lang}/${region}/journal/${slug}`;
}
function articleTypeUrl(slug: string, lang: WebsiteLanguage, region: WebsiteRegion = defaultRegion) {
	return `${url}/${lang}/${region}/journal/article-type/${slug}`;
}


function tagUrl(slug: string, lang: WebsiteLanguage, region: WebsiteRegion = defaultRegion) {
	return `${url}/${lang}/${region}/journal/tag/${slug}`;
}

function authorUrl(slug: string, lang: WebsiteLanguage, region: WebsiteRegion = defaultRegion) {
	return `${url}/${lang}/${region}/journal/author/${slug}`;
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
	articles: ISbStoryData<StoryblokArticle>[],
	articlesAlternativeLanguages: { lang: WebsiteLanguage; stories: ISbStoryData<StoryblokArticle>[] }[],
): MetadataRoute.Sitemap {
	const alternativeArticles = Object.fromEntries(
		articlesAlternativeLanguages.map(({ lang, stories }) => [lang, stories.map((it) => it.slug)]),
	) as Record<string, string[]>;
	return articles.map((article) => ({
		url: articleUrl(article.slug, defaultLanguage),
		alternates: {
			languages: generateAlternativeLanguages(alternativeArticles, article.slug),
		},
		changeFrequency: 'monthly',
		lastModified: toDateObject(article.updated_at || article.created_at, defaultLanguage).toString(),
	}));
}

function generateStoryblokAuthorsSitemap(authors: ISbStoryData<StoryblokAuthor>[]): MetadataRoute.Sitemap {
	return authors.map((author) => ({
		url: authorUrl(author.slug, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, authorUrl(author.slug, lang)])),
		},
		changeFrequency: 'weekly',
	}));
}

function generateStoryblokArticleTypeSitemap(tags: ISbStoryData<StoryblokArticleType>[]): MetadataRoute.Sitemap {
	return tags.map((tag) => ({
		url: articleTypeUrl(tag.slug, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, articleTypeUrl(tag.slug, lang)])),
		},
		changeFrequency: 'weekly',
	}));
}

function generateStoryblokTagSitemap(tags: ISbStoryData<StoryblokTag>[]): MetadataRoute.Sitemap {
	return tags.map((tag) => ({
		url: tagUrl(tag.slug, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, tagUrl(tag.slug, lang)])),
		},
		changeFrequency: 'weekly',
	}));
}

function staticPageUrl(route: string, lang: WebsiteLanguage, region: WebsiteRegion) {
	return `${url}/${lang}/${region}/${route}`;
}

function generateStaticPagesSitemap(): MetadataRoute.Sitemap {
	return staticRoutes.flatMap((route) =>
		websiteRegions.map((region) => ({
			url: staticPageUrl(route, defaultLanguage, region),
			alternates: {
				languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, staticPageUrl(route, lang, region)])),
			},
		})),
	);
}

function getArticlesInAlternativeLanguages() {
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
		const [articles, articlesAlternativeLanguages, authors, tags, articleTypes] = await Promise.all([
			getOverviewArticles(defaultLanguage),
			getArticlesInAlternativeLanguages(),
			getOverviewAuthors(defaultLanguage),
			getOverviewTags(defaultLanguage),
			getOverviewArticleTypes(defaultLanguage),
		]);
		return STATIC_SITEMAP.concat(
			generateStoryblokArticlesSitemap(articles, articlesAlternativeLanguages),
			generateStoryblokAuthorsSitemap(authors),
			generateStoryblokTagSitemap(tags),
			generateStoryblokArticleTypeSitemap(articleTypes),
		);
	} catch (error) {
		console.error('Failed to generate full sitemap', error);
		return STATIC_SITEMAP;
	}
}
