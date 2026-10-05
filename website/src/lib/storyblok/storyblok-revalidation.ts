import { mainWebsiteLanguages, websiteRegions } from '@/lib/i18n/utils';
import {
	getHomeStoryPath,
	getWebsitePathTailFromStoryblokSlug,
	getWebsiteRelativePathFromStoryblokSlug,
	isRoutableWebsiteStoryblokSlug,
	STORYBLOK_LAYOUT_PATH,
	WEBSITE_JOURNAL_PATH_SEGMENT,
	WEBSITE_PERSON_PATH_SEGMENT,
} from './storyblok-paths';

const aggregateRelativePaths = ['/', '/journal', '/impact-measurement'] as const;
const STORYBLOK_SLUGS_WITHOUT_PUBLIC_PAGE = new Set([getHomeStoryPath(), STORYBLOK_LAYOUT_PATH]);

export const pathsForStory = (fullSlug: string | undefined | null): string[] => {
	const relativePaths = new Set<string>(aggregateRelativePaths);
	const slug = fullSlug?.trim();
	const storyPath = slug ? relativePathForSlug(slug) : null;
	if (storyPath) {
		relativePaths.add(storyPath);
	}
	const paths = new Set<string>();
	for (const relativePath of relativePaths) {
		for (const language of mainWebsiteLanguages) {
			for (const region of websiteRegions) {
				paths.add(`/${language}/${region}${relativePath === '/' ? '' : relativePath}`);
			}
		}
	}
	paths.add('/sitemap.xml');

	return [...paths].sort();
};

const relativePathForSlug = (fullSlug: string): string | null => {
	if (STORYBLOK_SLUGS_WITHOUT_PUBLIC_PAGE.has(fullSlug)) {
		return null;
	}
	const websitePathTail = getWebsitePathTailFromStoryblokSlug(fullSlug);
	if (
		websitePathTail.startsWith(`${WEBSITE_JOURNAL_PATH_SEGMENT}/`) ||
		websitePathTail.startsWith(`${WEBSITE_PERSON_PATH_SEGMENT}/`)
	) {
		return `/${websitePathTail}`;
	}
	if (!isRoutableWebsiteStoryblokSlug(fullSlug)) {
		return null;
	}

	return getWebsiteRelativePathFromStoryblokSlug(fullSlug);
};
