import { type Messages } from '@/lib/i18n/messages';
import { defaultCurrency, defaultLanguage, mainWebsiteLanguages, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import {
	DEFAULT_OPEN_GRAPH_IMAGE_URL,
	toProductionMetadataUrl,
	WEBSITE_ORIGIN,
	type MetadataImage,
} from '@/lib/utils/metadata-image';
import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';

type MetadataKey = keyof Messages['website-common']['metadata'];

const SITE_NAME = 'Social Income';
const TITLE_SUFFIX = ` | ${SITE_NAME}`;
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/**
 * Get metadata for a page. The metadata is read from the i18n translation file. If a key is missing in the translation file,
 * the default metadata from the 'website-common' namespace is used.
 * @param language - The language to get the metadata for
 * @param namespace - The namespace to get the metadata from. If some key is not found in the namespace, it will be looked up in the 'website-common' namespace.
 * @param metadata - The metadata to merge with the default metadata
 * @returns The metadata for the website
 */
export const getMetadata = async (
	language: WebsiteLanguage,
	namespace: keyof Messages,
	metadata?: Metadata,
): Promise<Metadata> => {
	const messages = await getMessages({ locale: language });
	const translate = (key: MetadataKey): string => {
		const namespaceMessages: unknown = messages[namespace];
		const value =
			isRecord(namespaceMessages) && isRecord(namespaceMessages.metadata) ? namespaceMessages.metadata[key] : undefined;

		return typeof value === 'string' ? value : messages['website-common'].metadata[key];
	};
	const title = translate('title');
	const description = translate('description');
	const keywords = translate('keywords');
	const defaultMetadata = {
		title,
		description,
		keywords,
		metadataBase: new URL(WEBSITE_ORIGIN),
		openGraph: {
			title,
			description,
			images: toProductionMetadataUrl(translate('og-image'), DEFAULT_OPEN_GRAPH_IMAGE_URL),
		},
		twitter: {
			title,
			card: 'summary_large_image',
			site: '@so_income',
			creator: '@so_income',
			images: toProductionMetadataUrl(translate('twitter-image'), DEFAULT_OPEN_GRAPH_IMAGE_URL),
		},
	} satisfies Metadata;

	return {
		...defaultMetadata,
		...metadata,
		openGraph: {
			...defaultMetadata.openGraph,
			...metadata?.openGraph,
		},
		twitter: {
			...defaultMetadata.twitter,
			...metadata?.twitter,
		},
	};
};

const normalizeWhitespace = (text: string | null | undefined) => text?.replaceAll(/\s+/g, ' ').trim() ?? '';

const truncateAtWord = (text: string, maxLength: number) => {
	if (text.length <= maxLength) {
		return text;
	}
	// Slices one character more than fits: a space there means the last word before it is complete.
	const cut = text.slice(0, maxLength);
	const wordEnd = cut.lastIndexOf(' ');

	return `${(wordEnd > 0 ? cut.slice(0, wordEnd) : cut.slice(0, maxLength - 1)).replace(/[\s,.:;–—-]+$/, '')}…`;
};

// Titles that already start with the brand, like the home page's, keep their own wording.
export const formatPageTitle = (title: string | null | undefined) => {
	const text = normalizeWhitespace(title);
	if (!text) {
		return SITE_NAME;
	}
	if (text.startsWith(SITE_NAME)) {
		return truncateAtWord(text, MAX_TITLE_LENGTH);
	}

	return `${truncateAtWord(text, MAX_TITLE_LENGTH - TITLE_SUFFIX.length)}${TITLE_SUFFIX}`;
};

export const formatPageDescription = (description: string | null | undefined) =>
	truncateAtWord(normalizeWhitespace(description), MAX_DESCRIPTION_LENGTH);

export type LanguagePathTails = Map<WebsiteLanguage, string>;

const OPEN_GRAPH_LOCALES: Partial<Record<WebsiteLanguage, string>> = {
	en: 'en_US',
	de: 'de_CH',
	fr: 'fr_CH',
	it: 'it_CH',
};

const getWebsitePath = (language: WebsiteLanguage, pathTail: string) =>
	getWebsitePublicPath(language, defaultCurrency, pathTail);

const getContentLanguage = (lang: WebsiteLanguage, pathTails: LanguagePathTails) => {
	const languages = mainWebsiteLanguages.filter((language) => pathTails.has(language));

	return pathTails.has(lang) ? lang : (languages.find((language) => language === defaultLanguage) ?? languages[0]);
};

/** The canonical path of a page: its own translation, or the one that a language without a translation falls back to. */
export const getCanonicalPath = (lang: WebsiteLanguage, pathTails: LanguagePathTails) => {
	const contentLanguage = getContentLanguage(lang, pathTails);

	return contentLanguage ? getWebsitePath(contentLanguage, pathTails.get(contentLanguage) ?? '') : undefined;
};

export type WebsitePageMetadata = {
	title?: string | null;
	description?: string | null;
	image?: MetadataImage | string;
	article?: { publishedTime?: string; modifiedTime?: string; authors: string[]; section: string; tags: string[] };
	authors?: Metadata['authors'];
	keywords?: Metadata['keywords'];
};

/**
 * Metadata for a public website page. Next.js replaces rather than merges `openGraph` between segments, so every
 * page sets all of it here. Missing values fall back to the defaults.
 *
 * `pathTails` lists the published translations. Currency variants of a page differ only in how amounts are shown,
 * so the default currency's URL is canonical, and hreflang lists languages only: currencies are not regions. A
 * language without its own translation shows the fallback content, so it names that translation as canonical.
 */
export const getWebsitePageMetadata = async (
	lang: WebsiteLanguage,
	pathTails: LanguagePathTails,
	{ title, description, image, article, ...metadata }: WebsitePageMetadata,
): Promise<Metadata> => {
	const languages = mainWebsiteLanguages.filter((language) => pathTails.has(language));
	const contentLanguage = getContentLanguage(lang, pathTails);
	const path = (language: WebsiteLanguage) => getWebsitePath(language, pathTails.get(language) ?? '');
	const canonical = getCanonicalPath(lang, pathTails);

	const defaults = await getMetadata(lang, 'website-common');
	const pageTitle = formatPageTitle(title);
	const socialTitle = normalizeWhitespace(title) || pageTitle;
	const pageDescription = formatPageDescription(description) || defaults.description;
	const images = image ?? defaults.openGraph?.images;
	const locale = contentLanguage ? OPEN_GRAPH_LOCALES[contentLanguage] : undefined;
	const openGraph = {
		url: canonical,
		siteName: SITE_NAME,
		title: socialTitle,
		description: pageDescription ?? undefined,
		images,
		locale,
		alternateLocale: languages
			.filter((language) => language !== contentLanguage)
			.flatMap((language) => OPEN_GRAPH_LOCALES[language] ?? []),
	};

	return {
		...defaults,
		...metadata,
		title: pageTitle,
		description: pageDescription,
		alternates: {
			canonical,
			languages: {
				...Object.fromEntries(languages.map((language) => [language, path(language)])),
				...(pathTails.has(defaultLanguage) ? { 'x-default': path(defaultLanguage) } : {}),
			},
		},
		openGraph: article ? { ...openGraph, type: 'article', ...article } : { ...openGraph, type: 'website' },
		twitter: {
			...defaults.twitter,
			title: socialTitle,
			description: pageDescription ?? undefined,
			images,
		},
	};
};
