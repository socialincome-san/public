import type { Article, Author, Topic } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage, defaultRegion, WebsiteLanguage, WebsiteRegion, websiteRegions } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { toDateObject } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';
import type { MetadataRoute } from 'next';
import staticRoutes from './static-pages.json';

export const revalidate = 86400; // per day
const url = 'https://socialincome.org';

const SUPPORTED_LANGUAGES: WebsiteLanguage[] = ['de', 'fr', 'it'];

function articleUrl(slug: string, lang: WebsiteLanguage, region: WebsiteRegion = defaultRegion) {
	return `${url}/${lang}/${region}/journal/${slug}`;
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
	articles: ISbStoryData<Article>[],
	articlesAlternativeLanguages: { lang: WebsiteLanguage; stories: ISbStoryData<Article>[] }[],
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

function generateStoryblokAuthorsSitemap(authors: ISbStoryData<Author>[]): MetadataRoute.Sitemap {
	return authors.map((author) => ({
		url: authorUrl(author.slug, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, authorUrl(author.slug, lang)])),
		},
		changeFrequency: 'weekly',
	}));
}

function generateStoryblokTagSitemap(tags: ISbStoryData<Topic>[]): MetadataRoute.Sitemap {
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

const storyblokService = new StoryblokService();

async function getArticlesInAlternativeLanguages() {
	return Promise.all(
		SUPPORTED_LANGUAGES.map(async (lang) => {
			const res = await storyblokService.getOverviewArticles(lang);
			return { lang, stories: res.success ? res.data : [] };
		}),
	);
}

const STATIC_SITEMAP = generateStaticPagesSitemap();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	try {
		const [articlesRes, articlesAlternativeLanguages, authorsRes, tagsRes] = await Promise.all([
			storyblokService.getOverviewArticles(defaultLanguage),
			getArticlesInAlternativeLanguages(),
			storyblokService.getOverviewAuthors(defaultLanguage),
			storyblokService.getOverviewTags(defaultLanguage),
		]);

		const articles = articlesRes.success ? articlesRes.data : [];
		const authors = authorsRes.success ? authorsRes.data : [];
		const tags = tagsRes.success ? tagsRes.data : [];

		return STATIC_SITEMAP.concat(
			generateStoryblokArticlesSitemap(articles, articlesAlternativeLanguages),
			generateStoryblokAuthorsSitemap(authors),
			generateStoryblokTagSitemap(tags),
		);
	} catch (error) {
		console.error('Failed to generate full sitemap', error);
		return STATIC_SITEMAP;
	}
}
