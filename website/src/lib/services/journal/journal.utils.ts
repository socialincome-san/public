import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import type { Article, Person } from '@/generated/storyblok/types/109655/storyblok-components';
import {
	createWebsiteJournalPath,
	createWebsiteJournalTagLink,
	createWebsitePersonLink,
	formatStoryblokUrl,
} from '@/lib/services/storyblok/storyblok.utils';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoryData } from '@storyblok/js';

export const JOURNAL_RELATED_ARTICLES_COUNT = 3;

export const ARTICLE_HERO_IMAGE_WIDTH = 960;
export const ARTICLE_HERO_IMAGE_HEIGHT = 960;

const PERSON_PORTRAIT_WIDTH = 384;
const PERSON_PORTRAIT_HEIGHT = 480;

export const parseJournalTagSlug = (searchParams: Record<string, string | undefined>) =>
	typeof searchParams.tag === 'string' ? searchParams.tag : undefined;

export const buildJournalOverviewPathname = (journalPath: string, tagSlug?: string) =>
	tagSlug ? `${journalPath}?tag=${encodeURIComponent(tagSlug)}` : journalPath;

const buildHomeBreadcrumb = (homeLabel: string, lang: string, region: string): BreadcrumbLinkType => ({
	label: homeLabel,
	href: getWebsitePublicPath(lang, region, ''),
});

export const buildJournalOverviewBreadcrumbs = (
	homeLabel: string,
	journalLabel: string,
	journalPath: string,
	lang: string,
	region: string,
	tag?: { slug: string; label: string },
): BreadcrumbLinkType[] =>
	tag
		? [
				buildHomeBreadcrumb(homeLabel, lang, region),
				{ label: journalLabel, href: journalPath },
				{ label: tag.label, href: createWebsiteJournalTagLink(tag.slug, lang, region) },
			]
		: [buildHomeBreadcrumb(homeLabel, lang, region), { label: journalLabel, href: journalPath }];

export const buildJournalArticleBreadcrumbs = (
	homeLabel: string,
	journalLabel: string,
	journalPath: string,
	articleTitle: string,
	articleHref: string,
	lang: string,
	region: string,
): BreadcrumbLinkType[] => [
	buildHomeBreadcrumb(homeLabel, lang, region),
	{ label: journalLabel, href: journalPath },
	{ label: articleTitle, href: articleHref },
];

export const buildJournalPersonBreadcrumbs = (
	homeLabel: string,
	journalLabel: string,
	journalPath: string,
	personName: string,
	personHref: string,
	lang: string,
	region: string,
): BreadcrumbLinkType[] => [
	buildHomeBreadcrumb(homeLabel, lang, region),
	{ label: journalLabel, href: journalPath },
	{ label: personName, href: personHref },
];

export const getPersonPortraitSrc = (person: ISbStoryData<Person>) => {
	const { avatar } = person.content;
	if (!avatar?.filename) {
		return null;
	}

	return formatStoryblokUrl(avatar.filename, PERSON_PORTRAIT_WIDTH, PERSON_PORTRAIT_HEIGHT, avatar.focus);
};

export const hasArticleHeroLayout = (article: Pick<Article, 'useImageOnlyForPreview' | 'image'>) => {
	if (article.useImageOnlyForPreview) {
		return false;
	}

	return Boolean(article.image?.filename);
};

export const getArticleHeroImageSrc = (article: Pick<Article, 'image'>) => {
	const filename = article.image?.filename;
	if (!filename) {
		return null;
	}

	return formatStoryblokUrl(filename, ARTICLE_HERO_IMAGE_WIDTH, ARTICLE_HERO_IMAGE_HEIGHT, article.image?.focus);
};

export const getJournalPersonPagePaths = (slug: string, lang: string, region: string) => {
	const pathname = createWebsitePersonLink(slug, lang, region);

	return { pathname, journalPath: createWebsiteJournalPath(lang, region) };
};
