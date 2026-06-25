import {
	STORYBLOK_FAQ_FOLDER,
	STORYBLOK_LAYOUT_PATH,
	getCampaignsOverviewStoryPath,
	getCountriesOverviewStoryPath,
	getCountryStoryPath,
	getFocusStoryPath,
	getFocusesOverviewStoryPath,
	getHomeStoryPath,
	getJournalArticleStoryPath,
	getJournalTagStoryPath,
	getJournalTagWebsitePathTail,
	getLocalPartnerStoryPath,
	getLocalPartnersOverviewStoryPath,
	getPageStoryPath,
	getPersonStoryPath,
	getProgramStoryPath,
	getProgramsOverviewStoryPath,
	getWebsitePathTailFromStoryblokSlug,
	getWebsiteRelativePathFromStoryblokSlug,
	isAllowedStoryblokPreviewSlug,
	normalizeStoryblokSlug,
} from './storyblok-paths';

describe('storyblok-paths', () => {
	it('builds page story paths at the space root', () => {
		expect(getPageStoryPath('about')).toBe('pages/about');
		expect(getHomeStoryPath()).toBe('pages/home');
		expect(STORYBLOK_LAYOUT_PATH).toBe('globals/layout');
	});

	it('builds program story paths under pages/programs', () => {
		expect(getProgramsOverviewStoryPath()).toBe('pages/programs/programs');
		expect(getProgramStoryPath('winter-2024')).toBe('pages/programs/winter-2024');
	});

	it('builds focus story paths under pages/focuses', () => {
		expect(getFocusesOverviewStoryPath()).toBe('pages/focuses/focuses');
		expect(getFocusStoryPath('poverty')).toBe('pages/focuses/poverty');
	});

	it('builds campaign overview story path under pages/campaigns', () => {
		expect(getCampaignsOverviewStoryPath()).toBe('pages/campaigns/campaigns');
	});

	it('uses globals/faqs for faq stories', () => {
		expect(STORYBLOK_FAQ_FOLDER).toBe('globals/faqs');
	});

	it('builds country story paths under pages/countries', () => {
		expect(getCountriesOverviewStoryPath()).toBe('pages/countries/countries');
		expect(getCountryStoryPath('sierra-leone')).toBe('pages/countries/sierra-leone');
	});

	it('builds local partner story paths under pages/local-partners', () => {
		expect(getLocalPartnersOverviewStoryPath()).toBe('pages/local-partners/local-partners');
		expect(getLocalPartnerStoryPath('acme-ngo')).toBe('pages/local-partners/acme-ngo');
	});

	it('builds person story paths under pages/persons', () => {
		expect(getPersonStoryPath('jane-doe')).toBe('pages/persons/jane-doe');
	});

	it('builds journal article story paths under pages/journal', () => {
		expect(getJournalArticleStoryPath('my-article')).toBe('pages/journal/my-article');
	});

	it('builds journal tag story paths under globals/journal/tags', () => {
		expect(getJournalTagStoryPath('design')).toBe('globals/journal/tags/design');
		expect(getJournalTagWebsitePathTail('design')).toBe('journal/tag/design');
	});

	it('normalizes preview slugs', () => {
		expect(normalizeStoryblokSlug('pages/programs/foo')).toBe('pages/programs/foo');
		expect(normalizeStoryblokSlug('faq/donations')).toBe('pages/faq/donations');
		expect(normalizeStoryblokSlug('person/jane-doe')).toBe('pages/persons/jane-doe');
		expect(normalizeStoryblokSlug('persons/jane-doe')).toBe('pages/persons/jane-doe');
		expect(normalizeStoryblokSlug('pages/persons/jane-doe')).toBe('pages/persons/jane-doe');
		expect(normalizeStoryblokSlug('journal/my-article')).toBe('pages/journal/my-article');
		expect(normalizeStoryblokSlug('journal/tag/design')).toBe('globals/journal/tags/design');
		expect(normalizeStoryblokSlug('tag/design')).toBe('globals/journal/tags/design');
		expect(normalizeStoryblokSlug('tags/design')).toBe('globals/journal/tags/design');
		expect(normalizeStoryblokSlug('article-type/essay')).toBe('globals/journal/article-types/essay');
	});

	it('allows preview only for pages and layout, not journal reference entries', () => {
		expect(isAllowedStoryblokPreviewSlug('pages/journal/my-article')).toBe(true);
		expect(isAllowedStoryblokPreviewSlug('globals/layout')).toBe(true);
		expect(isAllowedStoryblokPreviewSlug('person/jane-doe')).toBe(true);
		expect(isAllowedStoryblokPreviewSlug('pages/persons/jane-doe')).toBe(true);
		expect(isAllowedStoryblokPreviewSlug('globals/journal/tags/design')).toBe(false);
		expect(isAllowedStoryblokPreviewSlug('tag/design')).toBe(false);
		expect(isAllowedStoryblokPreviewSlug('globals/journal/article-types/essay')).toBe(false);
	});

	it('maps storyblok slugs to public URL path tails', () => {
		expect(getWebsitePathTailFromStoryblokSlug('pages/programs/foo')).toBe('programs/foo');
		expect(getWebsitePathTailFromStoryblokSlug('pages/programs/programs')).toBe('programs');
		expect(getWebsitePathTailFromStoryblokSlug('pages/local-partners/acme-ngo')).toBe('local-partners/acme-ngo');
		expect(getWebsitePathTailFromStoryblokSlug('pages/local-partners/local-partners')).toBe('local-partners');
		expect(getWebsitePathTailFromStoryblokSlug('pages/focuses/poverty')).toBe('focuses/poverty');
		expect(getWebsitePathTailFromStoryblokSlug('pages/focuses/focuses')).toBe('focuses');
		expect(getWebsitePathTailFromStoryblokSlug('pages/countries/sierra-leone')).toBe('countries/sierra-leone');
		expect(getWebsitePathTailFromStoryblokSlug('pages/countries/countries')).toBe('countries');
		expect(getWebsitePathTailFromStoryblokSlug('pages/campaigns/campaigns')).toBe('campaigns');
		expect(getWebsitePathTailFromStoryblokSlug('pages/campaigns/summer')).toBe('campaigns/summer');
		expect(getWebsitePathTailFromStoryblokSlug('pages/persons/jane-doe')).toBe('person/jane-doe');
		expect(getWebsitePathTailFromStoryblokSlug('person/jane-doe')).toBe('person/jane-doe');
		expect(getWebsitePathTailFromStoryblokSlug('pages/journal/my-article')).toBe('journal/my-article');
		expect(getWebsitePathTailFromStoryblokSlug('journal/my-article')).toBe('journal/my-article');
		expect(getWebsitePathTailFromStoryblokSlug('globals/journal/tags/design')).toBe('journal/tag/design');
	});

	it('builds relative paths for revalidation', () => {
		expect(getWebsiteRelativePathFromStoryblokSlug('pages/about')).toBe('/about');
		expect(getWebsiteRelativePathFromStoryblokSlug('pages/home')).toBe('/');
		expect(getWebsiteRelativePathFromStoryblokSlug('pages/programs/foo')).toBe('/programs/foo');
		expect(getWebsiteRelativePathFromStoryblokSlug('pages/programs/programs')).toBe('/programs');
		expect(getWebsiteRelativePathFromStoryblokSlug('pages/persons/jane-doe')).toBe('/person/jane-doe');
		expect(getWebsiteRelativePathFromStoryblokSlug('pages/journal/my-article')).toBe('/journal/my-article');
	});
});
