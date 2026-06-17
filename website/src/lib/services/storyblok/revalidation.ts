import { mainWebsiteLanguages, websiteRegions } from '@/lib/i18n/utils';
import {
	getHomeStoryPath,
	getWebsitePathTailFromStoryblokSlug,
	getWebsiteRelativePathFromStoryblokSlug,
	isRoutableWebsiteStoryblokSlug,
	STORYBLOK_LAYOUT_PATH,
	WEBSITE_JOURNAL_PATH_SEGMENT,
	WEBSITE_PERSON_PATH_SEGMENT,
} from '@/lib/storyblok/storyblok-paths';

/**
 * Paths (without `/{lang}/{region}` prefix) that should be revalidated on any Storyblok webhook.
 */
const aggregateRelativePaths = ['/', '/journal', '/impact-measurement'] as const;

const STORYBLOK_SLUGS_WITHOUT_PUBLIC_PAGE = new Set([getHomeStoryPath(), STORYBLOK_LAYOUT_PATH]);

/**
 * Maps a Storyblok `full_slug` to its Next.js relative path (without `/{lang}/{region}` prefix).
 * Returns `null` if the slug is not tied to a specific page (e.g. home or layout).
 */
const relativePathForSlug = (fullSlug: string): string | null => {
	if (STORYBLOK_SLUGS_WITHOUT_PUBLIC_PAGE.has(fullSlug)) {
		return null;
	}
	const websitePathTail = getWebsitePathTailFromStoryblokSlug(fullSlug);
	if (websitePathTail.startsWith(`${WEBSITE_JOURNAL_PATH_SEGMENT}/`)) {
		return `/${websitePathTail}`;
	}
	if (websitePathTail.startsWith(`${WEBSITE_PERSON_PATH_SEGMENT}/`)) {
		return `/${websitePathTail}`;
	}

	if (!isRoutableWebsiteStoryblokSlug(fullSlug)) {
		return null;
	}

	return getWebsiteRelativePathFromStoryblokSlug(fullSlug);
};

/**
 * Returns the sorted list of absolute Next.js paths to revalidate when a Storyblok story changes.
 * Always includes aggregate pages (home, journal index, impact-measurement) across all locales,
 * plus the story's own path across all locales when the slug maps to a known route, plus `/sitemap.xml`.
 */
export const pathsForStory = (fullSlug: string | undefined | null): string[] => {
	const relativePaths = new Set<string>(aggregateRelativePaths);
	const slug = fullSlug?.trim();
	const storyPath = slug ? relativePathForSlug(slug) : null;
	if (storyPath) {
		relativePaths.add(storyPath);
	}

	const paths = new Set<string>();
	for (const relativePath of relativePaths) {
		for (const lang of mainWebsiteLanguages) {
			for (const region of websiteRegions) {
				const normalizedRelativePath = relativePath === '/' ? '' : relativePath;
				paths.add(`/${lang}/${region}${normalizedRelativePath}`);
			}
		}
	}
	paths.add('/sitemap.xml');

	return [...paths].sort();
};
