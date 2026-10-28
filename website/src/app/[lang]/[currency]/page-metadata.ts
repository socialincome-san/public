import { defaultLanguage, mainWebsiteLanguages, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsitePathTailFromStoryblokSlug, isRoutableWebsiteStoryblokSlug } from '@/lib/storyblok/storyblok-paths';
import { getWebsitePageMetadata, type LanguagePathTails, type WebsitePageMetadata } from '@/lib/utils/metadata';
import { getPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.cache';
import type { StoryblokPublishedLink } from '@/modules/storyblok-content/storyblok-content.types';

const isInvalidPathTail = (pathTail: string) =>
	mainWebsiteLanguages.some((websiteLang) => pathTail === websiteLang || pathTail.startsWith(`${websiteLang}/`));

const toPathTail = (slug: string): string | undefined => {
	if (!isRoutableWebsiteStoryblokSlug(slug)) {
		return undefined;
	}

	const pathTail = getWebsitePathTailFromStoryblokSlug(slug);
	if (pathTail.startsWith('auth/') || isInvalidPathTail(pathTail)) {
		return undefined;
	}

	return pathTail;
};

/** The published translations of a Storyblok page and the path each one lives at. */
export const getLinkPathTails = (link: StoryblokPublishedLink): LanguagePathTails => {
	const languages: LanguagePathTails = new Map();
	const enAlternate = link.alternates?.find((alternate) => alternate.lang === defaultLanguage);
	const defaultPathTail = toPathTail(link.slug);

	if (defaultPathTail && enAlternate?.published !== false) {
		languages.set(defaultLanguage, defaultPathTail);
	}

	for (const alternate of link.alternates ?? []) {
		if (!mainWebsiteLanguages.includes(alternate.lang as WebsiteLanguage) || alternate.published === false) {
			continue;
		}

		const pathTail = toPathTail(alternate.translated_slug);
		if (pathTail) {
			languages.set(alternate.lang as WebsiteLanguage, pathTail);
		}
	}

	return languages;
};

const isLinkAt = (link: StoryblokPublishedLink, pathTail: string) =>
	[link.slug, ...(link.alternates ?? []).map((alternate) => alternate.translated_slug)].some(
		(slug) => toPathTail(slug) === pathTail,
	);

/** Paths without a published Storyblok page, such as the journal index, are translated through the i18n files. */
export const findPathTails = (links: StoryblokPublishedLink[], pathTail: string): LanguagePathTails => {
	const link = links.find((candidate) => !candidate.is_folder && candidate.published && isLinkAt(candidate, pathTail));
	const pathTails = link ? getLinkPathTails(link) : new Map<WebsiteLanguage, string>();

	return pathTails.size > 0 ? pathTails : new Map(mainWebsiteLanguages.map((language) => [language, pathTail]));
};

const getPagePathTails = async (pathTail: string) => {
	const result = await getPublishedPageLinks();

	return findPathTails(result.success ? result.data : [], pathTail);
};

export const getPageMetadata = async (lang: WebsiteLanguage, pathTail: string, page: WebsitePageMetadata) =>
	getWebsitePageMetadata(lang, await getPagePathTails(pathTail), page);
