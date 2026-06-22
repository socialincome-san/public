import { mainWebsiteLanguages, websiteRegions } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { pathsForStory } from './revalidation';

const localeCount = mainWebsiteLanguages.length * websiteRegions.length;
const aggregatePathCount = 4 * localeCount;
const sitemapCount = 2;

const expectPathsForLocales = (relativePath: string, result: string[]) => {
	const expected = mainWebsiteLanguages.flatMap((lang) =>
		websiteRegions.map((region) => `/${lang}/${region}${relativePath}`),
	);
	for (const p of expected) {
		expect(result).toContain(p);
	}
};

describe('pathsForStory', () => {
	it('includes aggregate paths and sitemap when full_slug is empty', () => {
		const result = pathsForStory('');
		expect(result).toHaveLength(aggregatePathCount + sitemapCount);
		expectPathsForLocales('/new-website', result);
		expectPathsForLocales('/new-website/journal', result);
		expectPathsForLocales('/journal', result);
		expectPathsForLocales('/impact-measurement', result);
		expect(result).toContain('/sitemap.xml');
		expect(result).toContain(`/${NEW_WEBSITE_SLUG}/sitemap.xml`);
	});

	it('includes only aggregates + sitemap for unknown slug prefixes', () => {
		const result = pathsForStory('unknown/prefix/foo');
		expect(result).toHaveLength(aggregatePathCount + sitemapCount);
	});

	it('maps pages/about to /new-website/about', () => {
		const result = pathsForStory('pages/about');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/about', result);
		expect(result.some((p) => p.includes('/new-website/pages/'))).toBe(false);
	});

	it('does not add a story path for pages/home', () => {
		const result = pathsForStory('pages/home');
		expect(result).toHaveLength(aggregatePathCount + sitemapCount);
		expectPathsForLocales('/new-website', result);
	});

	it('maps pages/countries overview to /new-website/countries', () => {
		const result = pathsForStory('pages/countries/countries');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/countries', result);
	});

	it('maps pages/countries/foo to /new-website/countries/foo', () => {
		const result = pathsForStory('pages/countries/sierra-leone');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/countries/sierra-leone', result);
	});

	it('maps pages/focuses overview to /new-website/focuses', () => {
		const result = pathsForStory('pages/focuses/focuses');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/focuses', result);
	});

	it('maps pages/focuses/foo to /new-website/focuses/foo', () => {
		const result = pathsForStory('pages/focuses/poverty');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/focuses/poverty', result);
	});

	it('maps pages/local-partners overview to /new-website/local-partners', () => {
		const result = pathsForStory('pages/local-partners/local-partners');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/local-partners', result);
	});

	it('maps pages/local-partners/foo to /new-website/local-partners/foo', () => {
		const result = pathsForStory('pages/local-partners/acme-ngo');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/local-partners/acme-ngo', result);
	});

	it('maps pages/programs/foo to /new-website/programs/foo', () => {
		const result = pathsForStory('pages/programs/foo');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/programs/foo', result);
	});

	it('maps pages/programs overview to /new-website/programs', () => {
		const result = pathsForStory('pages/programs/programs');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/programs', result);
	});

	it('maps pages/campaigns overview to /new-website/campaigns', () => {
		const result = pathsForStory('pages/campaigns/campaigns');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/campaigns', result);
	});

	it('adds the story path for journal articles', () => {
		const result = pathsForStory('journal/my-article');
		expect(result).toHaveLength(aggregatePathCount + 2 * localeCount + sitemapCount);
		expectPathsForLocales('/journal/my-article', result);
		expectPathsForLocales('/new-website/journal/my-article', result);
	});

	it('adds the story path for journal articles under pages/journal', () => {
		const result = pathsForStory('pages/journal/my-article');
		expect(result).toHaveLength(aggregatePathCount + 2 * localeCount + sitemapCount);
		expectPathsForLocales('/journal/my-article', result);
		expectPathsForLocales('/new-website/journal/my-article', result);
	});

	it('handles journal/tag without double-prefixing', () => {
		const result = pathsForStory('journal/tag/design');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/tag/design', result);
		expectPathsForLocales('/new-website/journal', result);
		expect(result.some((p) => p.includes('/new-website/journal/tag/'))).toBe(false);
	});

	it('rewrites top-level tag/ slugs under /journal/tag/', () => {
		const result = pathsForStory('tag/design');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/tag/design', result);
		expectPathsForLocales('/new-website/journal', result);
	});

	it('rewrites tags under globals/journal/tags', () => {
		const result = pathsForStory('globals/journal/tags/design');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/tag/design', result);
		expectPathsForLocales('/new-website/journal', result);
	});

	it('adds the story path for person stories', () => {
		const result = pathsForStory('person/jane-doe');
		expect(result).toHaveLength(aggregatePathCount + 2 * localeCount + sitemapCount);
		expectPathsForLocales('/person/jane-doe', result);
		expectPathsForLocales('/new-website/person/jane-doe', result);
	});

	it('adds the story path for person stories under pages/persons', () => {
		const result = pathsForStory('pages/persons/jane-doe');
		expect(result).toHaveLength(aggregatePathCount + 2 * localeCount + sitemapCount);
		expectPathsForLocales('/person/jane-doe', result);
		expectPathsForLocales('/new-website/person/jane-doe', result);
	});

	it('returns sorted, de-duplicated paths', () => {
		const result = pathsForStory('journal/a');
		expect(result).toEqual([...result].sort());
		expect(new Set(result).size).toBe(result.length);
	});
});
