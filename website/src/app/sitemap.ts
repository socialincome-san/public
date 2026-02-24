import type { Article, Author, Topic } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage, defaultRegion, WebsiteLanguage, WebsiteRegion, websiteRegions } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { toDateObject } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';
import type { MetadataRoute } from 'next';
import staticRoutes from './static-pages.json';

export const revalidate = 86400; // per day
const url = 'https://socialincome.org';

const SUPPORTED_LANGUAGES: WebsiteLanguage[] = ['de', 'fr', 'it'];

const articleUrl = (slug: string, lang: WebsiteLanguage, region: WebsiteRegion = defaultRegion) => {
	return `${url}/${lang}/${region}/journal/${slug}`;
};

const tagUrl = (slug: string, lang: WebsiteLanguage, region: WebsiteRegion = defaultRegion) => {
	return `${url}/${lang}/${region}/journal/tag/${slug}`;
};

const authorUrl = (slug: string, lang: WebsiteLanguage, region: WebsiteRegion = defaultRegion) => {
	return `${url}/${lang}/${region}/journal/author/${slug}`;
};

const generateAlternativeLanguages = (alternativeArticles: Record<string, string[]>, slug: string) => {
	return Object.fromEntries(
		SUPPORTED_LANGUAGES.filter((lang) => alternativeArticles[lang].includes(slug)).map((lang) => [
			lang,
			articleUrl(slug, lang),
		]),
	);
};

const generateStoryblokArticlesSitemap = (
	articles: ISbStoryData<Article>[],
	articlesAlternativeLanguages: { lang: WebsiteLanguage; stories: ISbStoryData<Article>[] }[],
): MetadataRoute.Sitemap => {
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
};

const generateStoryblokAuthorsSitemap = (authors: ISbStoryData<Author>[]): MetadataRoute.Sitemap => {
	return authors.map((author) => ({
		url: authorUrl(author.slug, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, authorUrl(author.slug, lang)])),
		},
		changeFrequency: 'weekly',
	}));
};

const generateStoryblokTagSitemap = (tags: ISbStoryData<Topic>[]): MetadataRoute.Sitemap => {
	return tags.map((tag) => ({
		url: tagUrl(tag.slug, defaultLanguage),
		alternates: {
			languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, tagUrl(tag.slug, lang)])),
		},
		changeFrequency: 'weekly',
	}));
};

const staticPageUrl = (route: string, lang: WebsiteLanguage, region: WebsiteRegion) => {
	return `${url}/${lang}/${region}/${route}`;
};

const generateStaticPagesSitemap = (): MetadataRoute.Sitemap => {
	return staticRoutes.flatMap((route) =>
		websiteRegions.map((region) => ({
			url: staticPageUrl(route, defaultLanguage, region),
			alternates: {
				languages: Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, staticPageUrl(route, lang, region)])),
			},
		})),
	);
};

const getArticlesInAlternativeLanguages = async () => {
	return Promise.all(
		SUPPORTED_LANGUAGES.map(async (lang) => {
			const res = await services.storyblok.getOverviewArticles(lang);
			return { lang, stories: res.success ? res.data : [] };
		}),
	);
};

const STATIC_SITEMAP = generateStaticPagesSitemap();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	try {
		const [articlesRes, articlesAlternativeLanguages, authorsRes, tagsRes] = await Promise.all([
			services.storyblok.getOverviewArticles(defaultLanguage),
			getArticlesInAlternativeLanguages(),
			services.storyblok.getOverviewAuthors(defaultLanguage),
			services.storyblok.getOverviewTags(defaultLanguage),
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
