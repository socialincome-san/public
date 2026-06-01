import { mainWebsiteLanguages, websiteRegions } from '@/lib/i18n/utils';
import {
	getHomeStoryPath,
	getNewWebsiteRelativePathFromStoryblokSlug,
	isRoutableNewWebsiteStoryblokSlug,
	STORYBLOK_LAYOUT_PATH,
} from '@/lib/storyblok/storyblok-paths';

/**
 * Paths (without `/{lang}/{region}` prefix) that should be revalidated on any Storyblok webhook.
 */
const aggregateRelativePaths = ['/new-website', '/new-website/journal', '/journal', '/impact-measurement'] as const;

const STORYBLOK_SLUGS_WITHOUT_PUBLIC_PAGE = new Set([getHomeStoryPath(), STORYBLOK_LAYOUT_PATH]);

/**
 * Maps a Storyblok `full_slug` to its Next.js relative path (without `/{lang}/{region}` prefix).
 * Returns `null` if the slug is not tied to a specific page (e.g. home or layout).
 */
const relativePathForSlug = (fullSlug: string): string | null => {
	if (STORYBLOK_SLUGS_WITHOUT_PUBLIC_PAGE.has(fullSlug)) {
		return null;
	}
	if (fullSlug.startsWith('journal/') || fullSlug.startsWith('person/')) {
		return `/${fullSlug}`;
	}
	if (fullSlug.startsWith('tag/')) {
		return `/journal/${fullSlug}`;
	}

	if (!isRoutableNewWebsiteStoryblokSlug(fullSlug)) {
		return null;
	}

	return getNewWebsiteRelativePathFromStoryblokSlug(fullSlug);
};

/**
 * Returns the sorted list of absolute Next.js paths to revalidate when a Storyblok story changes.
 * Always includes aggregate pages (new-website home, journal index, impact-measurement) across all locales,
 * plus the story's own path across all locales when the slug maps to a known route, plus `/sitemap.xml`.
 */
export const pathsForStory = (fullSlug: string | undefined | null): string[] => {
	const relativePaths = new Set<string>(aggregateRelativePaths);
	const slug = fullSlug?.trim();
	const storyPath = slug ? relativePathForSlug(slug) : null;
	if (storyPath) {
		relativePaths.add(storyPath);
		if (storyPath.startsWith('/journal/tag/')) {
			relativePaths.add('/new-website/journal');
		} else if (storyPath.startsWith('/journal')) {
			relativePaths.add(storyPath.replace('/journal', '/new-website/journal'));
		}
		if (storyPath.startsWith('/person/')) {
			relativePaths.add(storyPath.replace('/person/', '/new-website/person/'));
		}
	}

	const paths = new Set<string>();
	for (const relativePath of relativePaths) {
		for (const lang of mainWebsiteLanguages) {
			for (const region of websiteRegions) {
				paths.add(`/${lang}/${region}${relativePath}`);
			}
		}
	}
	paths.add('/sitemap.xml');

	return [...paths].sort();
};
