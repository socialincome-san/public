import { mainWebsiteLanguages } from '@/lib/i18n/utils';
import { getWebsitePathTailFromStoryblokSlug, isRoutableWebsiteStoryblokSlug } from '@/lib/storyblok/storyblok-paths';
import { getPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.cache';

const EMPTY_PARAMS_PLACEHOLDER_SLUG = '__no-published-slugs__';

/**
 * Only prerendered slugs get their metadata in the static <head>. Unlisted slugs stream it into <body>,
 * where Google ignores rel=canonical and hreflang. Every slug is listed for every language because an
 * untranslated language still renders the fallback content, and its canonical must point to a translation.
 */
const getPublishedSubPaths = async (parentPathTail: string) => {
	const result = await getPublishedPageLinks();
	if (!result.success) {
		throw new Error(result.error ?? 'Failed to fetch Storyblok page links');
	}

	const prefix = parentPathTail ? `${parentPathTail}/` : '';
	const subPaths = new Set<string>();

	for (const link of result.data) {
		if (link.is_folder || !link.published) {
			continue;
		}

		for (const storyblokSlug of [link.slug, ...(link.alternates ?? []).map((alternate) => alternate.translated_slug)]) {
			if (!isRoutableWebsiteStoryblokSlug(storyblokSlug)) {
				continue;
			}

			const pathTail = getWebsitePathTailFromStoryblokSlug(storyblokSlug);
			const subPath = pathTail.startsWith(prefix) ? pathTail.slice(prefix.length) : '';
			if (subPath && !mainWebsiteLanguages.some((lang) => lang === subPath)) {
				subPaths.add(subPath);
			}
		}
	}

	return [...subPaths];
};

export const getPublishedSlugParams = async (parentPathTail = '') => {
	const slugs = (await getPublishedSubPaths(parentPathTail)).filter((subPath) => !subPath.includes('/'));

	// Cache Components fails the build on an empty list (e.g. the E2E Storyblok fixtures have no links). The placeholder renders a 404.
	return (slugs.length > 0 ? slugs : [EMPTY_PARAMS_PLACEHOLDER_SLUG]).map((slug) => ({ slug }));
};

/** Pages one folder below the parent, e.g. get-involved/individuals/donate. */
export const getPublishedFolderSlugParams = async (parentPathTail: string) => {
	const params = (await getPublishedSubPaths(parentPathTail)).flatMap((subPath) => {
		const [folder, slug, ...rest] = subPath.split('/');

		return folder && slug && rest.length === 0 ? [{ folder, slug }] : [];
	});

	return params.length > 0 ? params : [{ folder: EMPTY_PARAMS_PLACEHOLDER_SLUG, slug: EMPTY_PARAMS_PLACEHOLDER_SLUG }];
};
