import { mainWebsiteLanguages, websiteRegions } from '@/lib/i18n/utils';
import { pathsForStory } from './revalidation';

const localeCount = mainWebsiteLanguages.length * websiteRegions.length;
const aggregatePathCount = 3 * localeCount;
const sitemapCount = 1;

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
		expectPathsForLocales('', result);
		expectPathsForLocales('/journal', result);
		expectPathsForLocales('/impact-measurement', result);
		expect(result).toContain('/sitemap.xml');
	});

	it('includes only aggregates + sitemap for unknown slug prefixes', () => {
		const result = pathsForStory('unknown/prefix/foo');
		expect(result).toHaveLength(aggregatePathCount + sitemapCount);
	});

	it('maps pages/about to /about', () => {
		const result = pathsForStory('pages/about');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/about', result);
	});

	it('does not add a story path for pages/home', () => {
		const result = pathsForStory('pages/home');
		expect(result).toHaveLength(aggregatePathCount + sitemapCount);
		expectPathsForLocales('', result);
	});

	it('maps pages/countries overview to /countries', () => {
		const result = pathsForStory('pages/countries/countries');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/countries', result);
	});

	it('maps pages/countries/foo to /countries/foo', () => {
		const result = pathsForStory('pages/countries/sierra-leone');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/countries/sierra-leone', result);
	});

	it('maps pages/focuses overview to /focuses', () => {
		const result = pathsForStory('pages/focuses/focuses');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/focuses', result);
	});

	it('maps pages/focuses/foo to /focuses/foo', () => {
		const result = pathsForStory('pages/focuses/poverty');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/focuses/poverty', result);
	});

	it('maps pages/local-partners overview to /local-partners', () => {
		const result = pathsForStory('pages/local-partners/local-partners');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/local-partners', result);
	});

	it('maps pages/local-partners/foo to /local-partners/foo', () => {
		const result = pathsForStory('pages/local-partners/acme-ngo');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/local-partners/acme-ngo', result);
	});

	it('maps pages/programs/foo to /programs/foo', () => {
		const result = pathsForStory('pages/programs/foo');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/programs/foo', result);
	});

	it('maps pages/programs overview to /programs', () => {
		const result = pathsForStory('pages/programs/programs');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/programs', result);
	});

	it('maps pages/campaigns overview to /campaigns', () => {
		const result = pathsForStory('pages/campaigns/campaigns');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/campaigns', result);
	});

	it('adds the story path for journal articles', () => {
		const result = pathsForStory('journal/my-article');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/my-article', result);
	});

	it('adds the story path for journal articles under pages/journal', () => {
		const result = pathsForStory('pages/journal/my-article');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/my-article', result);
	});

	it('handles journal/tag without double-prefixing', () => {
		const result = pathsForStory('journal/tag/design');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/tag/design', result);
	});

	it('rewrites top-level tag/ slugs under /journal/tag/', () => {
		const result = pathsForStory('tag/design');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/tag/design', result);
	});

	it('rewrites tags under globals/journal/tags', () => {
		const result = pathsForStory('globals/journal/tags/design');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/tag/design', result);
	});

	it('adds the story path for person stories', () => {
		const result = pathsForStory('person/jane-doe');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/person/jane-doe', result);
	});

	it('adds the story path for person stories under pages/persons', () => {
		const result = pathsForStory('pages/persons/jane-doe');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/person/jane-doe', result);
	});

	it('returns sorted, de-duplicated paths', () => {
		const result = pathsForStory('journal/a');
		expect(result).toEqual([...result].sort());
		expect(new Set(result).size).toBe(result.length);
	});
});
