import { mainWebsiteLanguages } from '@/lib/i18n/utils';
import { getWebsitePathTailFromStoryblokSlug, isRoutableWebsiteStoryblokSlug } from '@/lib/storyblok/storyblok-paths';
import { getPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.cache';

/**
 * Only prerendered slugs get their metadata in the static <head>. Unlisted slugs stream it into <body>,
 * where Google ignores rel=canonical and hreflang. Every slug is listed for every language because
 * hreflang links all languages, translated or not.
 */
export const getPublishedSlugParams = async (parentPathTail = '') => {
	const result = await getPublishedPageLinks();
	if (!result.success) {
		throw new Error(result.error ?? 'Failed to fetch Storyblok page links');
	}

	const prefix = parentPathTail ? `${parentPathTail}/` : '';
	const slugs = new Set<string>();

	for (const link of result.data) {
		if (link.is_folder || !link.published) {
			continue;
		}

		for (const storyblokSlug of [link.slug, ...(link.alternates ?? []).map((alternate) => alternate.translated_slug)]) {
			if (!isRoutableWebsiteStoryblokSlug(storyblokSlug)) {
				continue;
			}

			const pathTail = getWebsitePathTailFromStoryblokSlug(storyblokSlug);
			const slug = pathTail.startsWith(prefix) ? pathTail.slice(prefix.length) : '';
			if (slug && !slug.includes('/') && !mainWebsiteLanguages.some((lang) => lang === slug)) {
				slugs.add(slug);
			}
		}
	}

	return [...slugs].map((slug) => ({ slug }));
};
