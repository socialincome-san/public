import { findPathTails, getLinkPathTails } from '@/app/[lang]/[currency]/page-metadata';
import { getCampaignStoryblokSlug } from '@/components/storyblok/campaign/campaign.utils';
import { defaultCurrency, defaultLanguage, mainWebsiteLanguages, type WebsiteLanguage } from '@/lib/i18n/utils';
import {
	getWebsitePathTailFromStoryblokSlug,
	getWebsitePublicPath,
	WEBSITE_JOURNAL_PATH_SEGMENT,
} from '@/lib/storyblok/storyblok-paths';
import { type LanguagePathTails } from '@/lib/utils/metadata';
import { WEBSITE_ORIGIN } from '@/lib/utils/metadata-image';
import { getCampaigns, getPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.cache';
import type { StoryblokPublishedLink } from '@/modules/storyblok-content/storyblok-content.types';
import type { MetadataRoute } from 'next';

// Only the canonical currency: the other currencies show the same content with converted amounts.
const absoluteUrl = (lang: WebsiteLanguage, pathTail: string) =>
	`${WEBSITE_ORIGIN}${getWebsitePublicPath(lang, defaultCurrency, pathTail)}`;

const collectStoryblokEntries = (links: StoryblokPublishedLink[]): LanguagePathTails[] => {
	const entries: LanguagePathTails[] = [];

	for (const link of links) {
		if (link.is_folder || !link.published) {
			continue;
		}

		// Campaigns are listed from their own stories below.
		if (getWebsitePathTailFromStoryblokSlug(link.slug).startsWith('campaigns/')) {
			continue;
		}

		const languages = getLinkPathTails(link);
		if (languages.size > 0) {
			entries.push(languages);
		}
	}

	return entries;
};

// Only listed campaigns, in the languages their page metadata names.
const collectCampaignEntries = async (links: StoryblokPublishedLink[]): Promise<LanguagePathTails[]> => {
	const result = await getCampaigns(defaultLanguage);
	if (!result.success) {
		return [];
	}

	return result.data.flatMap((story) => {
		const slug = getCampaignStoryblokSlug(story).trim();
		if (!slug) {
			return [];
		}

		return [findPathTails(links, `campaigns/${slug}`)];
	});
};

const ensureJournalIndex = (entries: LanguagePathTails[]) => {
	const hasJournalIndex = entries.some((languages) =>
		[...languages.values()].some((pathTail) => pathTail === WEBSITE_JOURNAL_PATH_SEGMENT),
	);

	if (!hasJournalIndex) {
		entries.push(new Map(mainWebsiteLanguages.map((lang) => [lang, WEBSITE_JOURNAL_PATH_SEGMENT])));
	}
};

const getPrimaryEntry = (languages: LanguagePathTails) => {
	if (languages.has(defaultLanguage)) {
		return { lang: defaultLanguage, pathTail: languages.get(defaultLanguage)! };
	}

	const [lang, pathTail] = languages.entries().next().value ?? [];
	if (!lang || pathTail === undefined) {
		return undefined;
	}

	return { lang, pathTail };
};

const dedupeEntries = (entries: LanguagePathTails[]) => {
	const byPathTail = new Map<string, LanguagePathTails>();

	for (const languages of entries) {
		const primary = getPrimaryEntry(languages);
		if (primary && !byPathTail.has(primary.pathTail)) {
			byPathTail.set(primary.pathTail, languages);
		}
	}

	return [...byPathTail.values()];
};

const buildEntry = (languages: LanguagePathTails): MetadataRoute.Sitemap => {
	const primary = getPrimaryEntry(languages);
	if (!primary) {
		return [];
	}

	return [
		{
			url: absoluteUrl(primary.lang, primary.pathTail),
			alternates: {
				languages: Object.fromEntries(
					[...languages.entries()].map(([lang, pathTail]) => [lang, absoluteUrl(lang, pathTail)]),
				),
			},
			changeFrequency: primary.pathTail.startsWith('journal/') ? 'monthly' : 'weekly',
		},
	];
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
	try {
		const linksResult = await getPublishedPageLinks();
		if (!linksResult.success) {
			throw new Error(linksResult.error ?? 'Failed to fetch Storyblok page links');
		}

		const entries = dedupeEntries([
			...collectStoryblokEntries(linksResult.data),
			...(await collectCampaignEntries(linksResult.data)),
		]);

		ensureJournalIndex(entries);

		entries.sort((left, right) =>
			(getPrimaryEntry(left)?.pathTail ?? '').localeCompare(getPrimaryEntry(right)?.pathTail ?? ''),
		);

		return entries.flatMap(buildEntry);
	} catch (error) {
		console.error('Failed to generate sitemap', error);

		return [];
	}
};

export default sitemap;
