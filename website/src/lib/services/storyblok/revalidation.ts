import { mainWebsiteLanguages, websiteRegions } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

/**
 * Paths (without `/{lang}/{region}` prefix) that should be revalidated on any Storyblok webhook.
 */
const aggregateRelativePaths = ['/new-website', '/new-website/journal', '/journal', '/impact-measurement'] as const;

/**
 * Maps a Storyblok `full_slug` to its Next.js relative path (without `/{lang}/{region}` prefix).
 * Returns `null` if the slug is not tied to a specific page (e.g. root or unsupported prefix).
 */
const relativePathForSlug = (fullSlug: string): string | null => {
	if (fullSlug === NEW_WEBSITE_SLUG) {
		return null;
	}
	if (fullSlug.startsWith(`${NEW_WEBSITE_SLUG}/`) || fullSlug.startsWith('journal/') || fullSlug.startsWith('person/')) {
		return `/${fullSlug}`;
	}
	if (fullSlug.startsWith('tag/')) {
		return `/journal/${fullSlug}`;
	}

	return null;
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
