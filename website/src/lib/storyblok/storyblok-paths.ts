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

	if (slug.startsWith('journal/') || slug.startsWith('person/') || slug.startsWith('tag/')) {
		return true;
	}

	return slug.startsWith(pagesPrefix) || slug.startsWith(`${STORYBLOK_GLOBALS_FOLDER}/`);
};
