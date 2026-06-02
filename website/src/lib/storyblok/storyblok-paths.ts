import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

export const STORYBLOK_PAGES_FOLDER = 'pages';

const STORYBLOK_GLOBALS_FOLDER = 'globals';

const STORYBLOK_HOME_PAGE_SLUG = 'home';

export const STORYBLOK_LAYOUT_PATH = `${STORYBLOK_GLOBALS_FOLDER}/layout`;

const pagesPrefix = `${STORYBLOK_PAGES_FOLDER}/`;

export const getPageStoryPath = (pageSlug: string) => `${pagesPrefix}${pageSlug}`;

export const getHomeStoryPath = () => getPageStoryPath(STORYBLOK_HOME_PAGE_SLUG);

export const STORYBLOK_PROGRAMS_FOLDER = `${STORYBLOK_PAGES_FOLDER}/programs`;

const STORYBLOK_PROGRAMS_OVERVIEW_SLUG = 'programs';

export const getProgramsOverviewStoryPath = () => `${STORYBLOK_PROGRAMS_FOLDER}/${STORYBLOK_PROGRAMS_OVERVIEW_SLUG}`;

export const getProgramStoryPath = (programSlug: string) => `${STORYBLOK_PROGRAMS_FOLDER}/${programSlug}`;

export const STORYBLOK_LOCAL_PARTNERS_FOLDER = `${STORYBLOK_PAGES_FOLDER}/local-partners`;

const STORYBLOK_LOCAL_PARTNERS_OVERVIEW_SLUG = 'local-partners';

export const getLocalPartnersOverviewStoryPath = () =>
	`${STORYBLOK_LOCAL_PARTNERS_FOLDER}/${STORYBLOK_LOCAL_PARTNERS_OVERVIEW_SLUG}`;

export const getLocalPartnerStoryPath = (localPartnerSlug: string) =>
	`${STORYBLOK_LOCAL_PARTNERS_FOLDER}/${localPartnerSlug}`;

export const STORYBLOK_FOCUSES_FOLDER = `${STORYBLOK_PAGES_FOLDER}/focuses`;

const STORYBLOK_FOCUSES_OVERVIEW_SLUG = 'focuses';

export const getFocusesOverviewStoryPath = () => `${STORYBLOK_FOCUSES_FOLDER}/${STORYBLOK_FOCUSES_OVERVIEW_SLUG}`;

export const getFocusStoryPath = (focusSlug: string) => `${STORYBLOK_FOCUSES_FOLDER}/${focusSlug}`;

export const STORYBLOK_COUNTRIES_FOLDER = `${STORYBLOK_PAGES_FOLDER}/countries`;

const STORYBLOK_COUNTRIES_OVERVIEW_SLUG = 'countries';

export const getCountriesOverviewStoryPath = () => `${STORYBLOK_COUNTRIES_FOLDER}/${STORYBLOK_COUNTRIES_OVERVIEW_SLUG}`;

export const getCountryStoryPath = (countrySlug: string) => `${STORYBLOK_COUNTRIES_FOLDER}/${countrySlug}`;

const STORYBLOK_CAMPAIGNS_FOLDER = `${STORYBLOK_PAGES_FOLDER}/campaigns`;

const STORYBLOK_CAMPAIGNS_OVERVIEW_SLUG = 'campaigns';

export const getCampaignsOverviewStoryPath = () => `${STORYBLOK_CAMPAIGNS_FOLDER}/${STORYBLOK_CAMPAIGNS_OVERVIEW_SLUG}`;

export const STORYBLOK_FAQ_FOLDER = `${STORYBLOK_PAGES_FOLDER}/faq`;

const STORYBLOK_PERSONS_FOLDER = `${STORYBLOK_PAGES_FOLDER}/persons`;

export const WEBSITE_PERSON_PATH_SEGMENT = 'person';

export const getPersonStoryPath = (personSlug: string) => `${STORYBLOK_PERSONS_FOLDER}/${personSlug}`;

const STORYBLOK_JOURNAL_FOLDER = `${STORYBLOK_PAGES_FOLDER}/journal`;

export const WEBSITE_JOURNAL_PATH_SEGMENT = 'journal';

const STORYBLOK_GLOBALS_JOURNAL_FOLDER = `${STORYBLOK_GLOBALS_FOLDER}/journal`;

const STORYBLOK_JOURNAL_TAGS_FOLDER = `${STORYBLOK_GLOBALS_JOURNAL_FOLDER}/tags`;

const STORYBLOK_JOURNAL_ARTICLE_TYPES_FOLDER = `${STORYBLOK_GLOBALS_JOURNAL_FOLDER}/article-types`;

export const getJournalArticleStoryPath = (articleSlug: string) => `${STORYBLOK_JOURNAL_FOLDER}/${articleSlug}`;

export const getJournalTagStoryPath = (tagSlug: string) => `${STORYBLOK_JOURNAL_TAGS_FOLDER}/${tagSlug}`;

const getJournalArticleTypeStoryPath = (articleTypeSlug: string) =>
	`${STORYBLOK_JOURNAL_ARTICLE_TYPES_FOLDER}/${articleTypeSlug}`;

export const getJournalTagWebsitePathTail = (tagSlug: string) => `${WEBSITE_JOURNAL_PATH_SEGMENT}/tag/${tagSlug}`;

const isJournalGlobalsReferenceSlug = (slug: string) =>
	slug.startsWith(`${STORYBLOK_JOURNAL_TAGS_FOLDER}/`) || slug.startsWith(`${STORYBLOK_JOURNAL_ARTICLE_TYPES_FOLDER}/`);

/**
 * Normalizes slugs from Storyblok preview URLs or legacy paths to current space paths.
 * e.g. `new-website/programs/foo` → `pages/programs/foo`
 */
export const normalizeStoryblokSlug = (rawSlug: string): string => {
	let slug = rawSlug.trim();
	const newWebsitePrefix = `${NEW_WEBSITE_SLUG}/`;

	if (slug.startsWith(newWebsitePrefix)) {
		slug = slug.slice(newWebsitePrefix.length);
	}

	if (slug === STORYBLOK_PROGRAMS_OVERVIEW_SLUG || slug === STORYBLOK_PROGRAMS_FOLDER) {
		return getProgramsOverviewStoryPath();
	}

	if (slug === STORYBLOK_LOCAL_PARTNERS_OVERVIEW_SLUG || slug === STORYBLOK_LOCAL_PARTNERS_FOLDER) {
		return getLocalPartnersOverviewStoryPath();
	}

	if (slug === STORYBLOK_FOCUSES_OVERVIEW_SLUG || slug === STORYBLOK_FOCUSES_FOLDER) {
		return getFocusesOverviewStoryPath();
	}

	if (slug === STORYBLOK_COUNTRIES_OVERVIEW_SLUG || slug === STORYBLOK_COUNTRIES_FOLDER) {
		return getCountriesOverviewStoryPath();
	}

	if (slug === STORYBLOK_CAMPAIGNS_OVERVIEW_SLUG || slug === STORYBLOK_CAMPAIGNS_FOLDER) {
		return getCampaignsOverviewStoryPath();
	}

	if (slug.startsWith('programs/') && !slug.startsWith(`${STORYBLOK_PROGRAMS_FOLDER}/`)) {
		return `${STORYBLOK_PAGES_FOLDER}/${slug}`;
	}

	if (slug.startsWith('local-partners/') && !slug.startsWith(`${STORYBLOK_LOCAL_PARTNERS_FOLDER}/`)) {
		return `${STORYBLOK_PAGES_FOLDER}/${slug}`;
	}

	if (slug.startsWith('focuses/') && !slug.startsWith(`${STORYBLOK_FOCUSES_FOLDER}/`)) {
		return `${STORYBLOK_PAGES_FOLDER}/${slug}`;
	}

	if (slug.startsWith('countries/') && !slug.startsWith(`${STORYBLOK_COUNTRIES_FOLDER}/`)) {
		return `${STORYBLOK_PAGES_FOLDER}/${slug}`;
	}

	if (slug.startsWith('campaigns/') && !slug.startsWith(`${STORYBLOK_CAMPAIGNS_FOLDER}/`)) {
		return `${STORYBLOK_PAGES_FOLDER}/${slug}`;
	}

	if (slug.startsWith('faq/') && !slug.startsWith(`${STORYBLOK_FAQ_FOLDER}/`)) {
		return `${STORYBLOK_PAGES_FOLDER}/${slug}`;
	}

	if (slug.startsWith('partnerships/') && !slug.startsWith(`${STORYBLOK_PAGES_FOLDER}/partnerships/`)) {
		return `${STORYBLOK_PAGES_FOLDER}/${slug}`;
	}

	if (slug.startsWith('documents/') && !slug.startsWith(`${STORYBLOK_PAGES_FOLDER}/documents/`)) {
		return `${STORYBLOK_PAGES_FOLDER}/${slug}`;
	}

	if (slug.startsWith('person/') && !slug.startsWith(`${STORYBLOK_PERSONS_FOLDER}/`)) {
		return getPersonStoryPath(slug.slice('person/'.length));
	}

	if (slug.startsWith('persons/') && !slug.startsWith(`${STORYBLOK_PERSONS_FOLDER}/`)) {
		return getPersonStoryPath(slug.slice('persons/'.length));
	}

	if (slug.startsWith('journal/tag/')) {
		return getJournalTagStoryPath(slug.slice('journal/tag/'.length));
	}

	if (slug.startsWith('tag/') && !slug.startsWith(`${STORYBLOK_JOURNAL_TAGS_FOLDER}/`)) {
		return getJournalTagStoryPath(slug.slice('tag/'.length));
	}

	if (slug.startsWith('tags/') && !slug.startsWith(`${STORYBLOK_JOURNAL_TAGS_FOLDER}/`)) {
		return getJournalTagStoryPath(slug.slice('tags/'.length));
	}

	if (slug.startsWith('article-type/') && !slug.startsWith(`${STORYBLOK_JOURNAL_ARTICLE_TYPES_FOLDER}/`)) {
		return getJournalArticleTypeStoryPath(slug.slice('article-type/'.length));
	}

	if (slug.startsWith('article-types/') && !slug.startsWith(`${STORYBLOK_JOURNAL_ARTICLE_TYPES_FOLDER}/`)) {
		return getJournalArticleTypeStoryPath(slug.slice('article-types/'.length));
	}

	if (slug.startsWith(`${WEBSITE_JOURNAL_PATH_SEGMENT}/`) && !slug.startsWith(`${STORYBLOK_JOURNAL_FOLDER}/`)) {
		const journalTail = slug.slice(`${WEBSITE_JOURNAL_PATH_SEGMENT}/`.length);

		if (journalTail.startsWith('tag/')) {
			return getJournalTagStoryPath(journalTail.slice('tag/'.length));
		}

		return getJournalArticleStoryPath(journalTail);
	}

	return slug;
};

/**
 * Maps a Storyblok `full_slug` to the URL segment after `/new-website/`.
 * `pages/about` → `about`; `pages/programs/foo` → `programs/foo`.
 */
export const getWebsitePathTailFromStoryblokSlug = (storyblokSlug: string): string => {
	const slug = normalizeStoryblokSlug(storyblokSlug);

	if (slug === getHomeStoryPath()) {
		return '';
	}

	if (slug === getProgramsOverviewStoryPath()) {
		return 'programs';
	}

	if (slug === getLocalPartnersOverviewStoryPath()) {
		return 'local-partners';
	}

	if (slug === getFocusesOverviewStoryPath()) {
		return 'focuses';
	}

	if (slug === getCountriesOverviewStoryPath()) {
		return 'countries';
	}

	if (slug === getCampaignsOverviewStoryPath()) {
		return 'campaigns';
	}

	if (slug.startsWith(`${STORYBLOK_PERSONS_FOLDER}/`)) {
		return `${WEBSITE_PERSON_PATH_SEGMENT}/${slug.slice(STORYBLOK_PERSONS_FOLDER.length + 1)}`;
	}

	if (slug.startsWith(`${STORYBLOK_JOURNAL_FOLDER}/`)) {
		return `${WEBSITE_JOURNAL_PATH_SEGMENT}/${slug.slice(STORYBLOK_JOURNAL_FOLDER.length + 1)}`;
	}

	if (slug.startsWith(`${STORYBLOK_JOURNAL_TAGS_FOLDER}/`)) {
		return getJournalTagWebsitePathTail(slug.slice(STORYBLOK_JOURNAL_TAGS_FOLDER.length + 1));
	}

	if (slug.startsWith(pagesPrefix)) {
		return slug.slice(pagesPrefix.length);
	}

	return slug;
};

export const getNewWebsiteRelativePathFromStoryblokSlug = (storyblokSlug: string): string => {
	const tail = getWebsitePathTailFromStoryblokSlug(storyblokSlug);

	return tail ? `/${NEW_WEBSITE_SLUG}/${tail}` : `/${NEW_WEBSITE_SLUG}`;
};

export const getNewWebsitePublicPath = (lang: string, region: string, websitePathTail: string) => {
	const relativePath = websitePathTail ? `/${NEW_WEBSITE_SLUG}/${websitePathTail}` : `/${NEW_WEBSITE_SLUG}`;

	return `/${lang}/${region}${relativePath}`;
};

export const isRoutableNewWebsiteStoryblokSlug = (storyblokSlug: string) => {
	const slug = normalizeStoryblokSlug(storyblokSlug);

	return slug.startsWith(pagesPrefix);
};

export const isAllowedStoryblokPreviewSlug = (rawSlug: string) => {
	const slug = normalizeStoryblokSlug(rawSlug);

	if (isJournalGlobalsReferenceSlug(slug)) {
		return false;
	}

	return slug.startsWith(pagesPrefix) || slug === STORYBLOK_LAYOUT_PATH;
};
