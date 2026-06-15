import {
	defaultLanguage,
	mainWebsiteLanguages,
	type WebsiteLanguage,
	type WebsiteRegion,
	websiteRegions,
} from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { StoryblokPublishedLink } from '@/lib/services/storyblok/storyblok.service';
import {
	getNewWebsitePublicPath,
	getWebsitePathTailFromStoryblokSlug,
	isRoutableNewWebsiteStoryblokSlug,
	WEBSITE_JOURNAL_PATH_SEGMENT,
} from '@/lib/storyblok/storyblok-paths';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { MetadataRoute } from 'next';

export const revalidate = 86400;

const SITE_URL = 'https://socialincome.org';

type PathTailByLanguage = Map<WebsiteLanguage, string>;

const absoluteUrl = (lang: WebsiteLanguage, region: WebsiteRegion, pathTail: string) =>
	`${SITE_URL}${getNewWebsitePublicPath(lang, region, pathTail)}`;

const isInvalidPathTail = (pathTail: string) =>
	mainWebsiteLanguages.some((websiteLang) => pathTail === websiteLang || pathTail.startsWith(`${websiteLang}/`));

const toPathTail = (slug: string): string | undefined => {
	if (!isRoutableNewWebsiteStoryblokSlug(slug)) {
		return undefined;
	}

	const pathTail = getWebsitePathTailFromStoryblokSlug(slug);
	if (pathTail.startsWith('auth/') || isInvalidPathTail(pathTail)) {
		return undefined;
	}

	return pathTail;
};

const collectLanguagesForLink = (link: StoryblokPublishedLink): PathTailByLanguage => {
	const languages = new Map<WebsiteLanguage, string>();
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

const collectStoryblokEntries = (links: StoryblokPublishedLink[]): PathTailByLanguage[] => {
	const entries: PathTailByLanguage[] = [];

	for (const link of links) {
		if (link.is_folder || !link.published) {
			continue;
		}

		const languages = collectLanguagesForLink(link);
		if (languages.size > 0) {
			entries.push(languages);
		}
	}

	return entries;
};

const collectCampaignEntries = async (): Promise<PathTailByLanguage[]> => {
	const result = await services.read.campaign.getPublicCampaigns();
	if (!result.success) {
		return [];
	}

	return result.data.map((campaign) => {
		const pathTail = `campaigns/${campaign.slug}`;

		return new Map(mainWebsiteLanguages.map((lang) => [lang, pathTail]));
	});
};

const ensureJournalIndex = (entries: PathTailByLanguage[]) => {
	const hasJournalIndex = entries.some((languages) =>
		[...languages.values()].some((pathTail) => pathTail === WEBSITE_JOURNAL_PATH_SEGMENT),
	);

	if (!hasJournalIndex) {
		entries.push(new Map(mainWebsiteLanguages.map((lang) => [lang, WEBSITE_JOURNAL_PATH_SEGMENT])));
	}
};

const getPrimaryEntry = (languages: PathTailByLanguage) => {
	if (languages.has(defaultLanguage)) {
		return { lang: defaultLanguage, pathTail: languages.get(defaultLanguage)! };
	}

	const [lang, pathTail] = languages.entries().next().value ?? [];
	if (!lang || !pathTail) {
		return undefined;
	}

	return { lang, pathTail };
};

const dedupeEntries = (entries: PathTailByLanguage[]) => {
	const byPathTail = new Map<string, PathTailByLanguage>();

	for (const languages of entries) {
		const primary = getPrimaryEntry(languages);
		if (primary && !byPathTail.has(primary.pathTail)) {
			byPathTail.set(primary.pathTail, languages);
		}
	}

	return [...byPathTail.values()];
};

const buildRegionalEntries = (languages: PathTailByLanguage): MetadataRoute.Sitemap => {
	const primary = getPrimaryEntry(languages);
	if (!primary) {
		return [];
	}

	return websiteRegions.map((region) => ({
		url: absoluteUrl(primary.lang, region, primary.pathTail),
		alternates: {
			languages: Object.fromEntries(
				[...languages.entries()].map(([lang, pathTail]) => [lang, absoluteUrl(lang, region, pathTail)]),
			),
		},
		changeFrequency: primary.pathTail.startsWith('journal/') ? 'monthly' : 'weekly',
	}));
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
	try {
		const linksResult = await services.storyblok.getPublishedPageLinks();
		if (!linksResult.success) {
			throw new Error(linksResult.error ?? 'Failed to fetch Storyblok page links');
		}

		const entries = dedupeEntries([
			...collectStoryblokEntries(linksResult.data),
			...(await collectCampaignEntries()),
		]);

		ensureJournalIndex(entries);

		entries.sort((left, right) =>
			(getPrimaryEntry(left)?.pathTail ?? '').localeCompare(getPrimaryEntry(right)?.pathTail ?? ''),
		);

		return entries.flatMap(buildRegionalEntries);
	} catch (error) {
		console.error(`Failed to generate ${NEW_WEBSITE_SLUG} sitemap`, error);

		return [];
	}
};

export default sitemap;
