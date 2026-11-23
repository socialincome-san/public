import { findPathTails, getLinkPathTails } from '@/app/[lang]/[currency]/page-metadata';
import { getCampaignStoryblokSlug } from '@/components/storyblok/campaign/campaign.utils';
import { defaultLanguage, mainWebsiteLanguages } from '@/lib/i18n/utils';
import { getWebsitePathTailFromStoryblokSlug, WEBSITE_JOURNAL_PATH_SEGMENT } from '@/lib/storyblok/storyblok-paths';
import { getCanonicalPath, getHreflangPaths } from '@/lib/utils/metadata';
import { WEBSITE_ORIGIN } from '@/lib/utils/metadata-image';
import { getCampaigns, getPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.cache';
import type { StoryblokPublishedLink } from '@/modules/storyblok-content/storyblok-content.types';
import type { MetadataRoute } from 'next';

// Resolved like the head's canonical and hreflang, which Next.js resolves against metadataBase.
const absoluteUrl = (path: string) => new URL(path, WEBSITE_ORIGIN).href;

const collectStoryblokPathTails = (links: StoryblokPublishedLink[]) =>
	links.flatMap((link) => {
		// Campaigns are listed from their own stories below.
		if (link.is_folder || !link.published || getWebsitePathTailFromStoryblokSlug(link.slug).startsWith('campaigns/')) {
			return [];
		}

		return [...getLinkPathTails(link).values()];
	});

// Only listed campaigns
const collectCampaignPathTails = async () => {
	const result = await getCampaigns(defaultLanguage);
	if (!result.success) {
		return [];
	}

	return result.data.flatMap((story) => {
		const slug = getCampaignStoryblokSlug(story).trim();

		return slug ? [`campaigns/${slug}`] : [];
	});
};

// Pages without a Storyblok story
const STATIC_PATH_TAILS = [WEBSITE_JOURNAL_PATH_SEGMENT, 'open-research/country-eligibility'];

/**
 * One entry per language URL that is its own canonical. A language without a published translation renders
 * the fallback content with the translation as canonical, so it is neither listed nor named as an alternate.
 * Every entry of a page carries the hreflang set its head renders. Only the canonical currency is listed: the
 * other currencies show the same content with converted amounts.
 */
const buildEntries = (links: StoryblokPublishedLink[], pathTail: string): MetadataRoute.Sitemap => {
	const pathTails = findPathTails(links, pathTail);
	const languages = Object.fromEntries(
		Object.entries(getHreflangPaths(pathTails)).map(([hreflang, path]) => [hreflang, absoluteUrl(path)]),
	);

	const changeFrequency = pathTail.startsWith('journal/') ? 'monthly' : 'weekly';

	return mainWebsiteLanguages.flatMap((lang) => {
		const canonicalPath = pathTails.get(lang) === pathTail ? getCanonicalPath(lang, pathTails) : undefined;

		return canonicalPath ? [{ url: absoluteUrl(canonicalPath), alternates: { languages }, changeFrequency }] : [];
	});
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
	try {
		const linksResult = await getPublishedPageLinks();
		if (!linksResult.success) {
			console.error('Failed to generate sitemap', linksResult.error);

			return [];
		}

		const pathTails = new Set([
			...collectStoryblokPathTails(linksResult.data),
			...(await collectCampaignPathTails()),
			...STATIC_PATH_TAILS,
		]);

		return [...pathTails]
			.sort((left, right) => left.localeCompare(right))
			.flatMap((pathTail) => buildEntries(linksResult.data, pathTail));
	} catch (error) {
		console.error('Failed to generate sitemap', error);

		return [];
	}
};

export default sitemap;
