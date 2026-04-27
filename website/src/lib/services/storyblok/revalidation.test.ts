import { mainWebsiteLanguages, websiteRegions } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
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
		expectPathsForLocales('/new-website', result);
		expectPathsForLocales('/journal', result);
		expectPathsForLocales('/impact-measurement', result);
		expect(result).toContain('/sitemap.xml');
	});

	it('includes only aggregates + sitemap for unknown slug prefixes', () => {
		const result = pathsForStory('unknown/prefix/foo');
		expect(result).toHaveLength(aggregatePathCount + sitemapCount);
	});

	it('does not add a story path for the new-website root', () => {
		const result = pathsForStory(NEW_WEBSITE_SLUG);
		expect(result).toHaveLength(aggregatePathCount + sitemapCount);
		expectPathsForLocales('/new-website', result);
	});

	it('adds the story path for new-website nested slugs', () => {
		const result = pathsForStory(`${NEW_WEBSITE_SLUG}/campaigns/summer`);
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/new-website/campaigns/summer', result);
	});

	it('adds the story path for journal articles', () => {
		const result = pathsForStory('journal/my-article');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/my-article', result);
	});

	it('handles journal/tag without double-prefixing', () => {
		const result = pathsForStory('journal/tag/design');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/tag/design', result);
		expect(result.some((p) => p.includes('/journal/journal/'))).toBe(false);
	});

	it('rewrites top-level tag/ slugs under /journal/tag/', () => {
		const result = pathsForStory('tag/design');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/journal/tag/design', result);
	});

	it('adds the story path for person stories', () => {
		const result = pathsForStory('person/jane-doe');
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales('/person/jane-doe', result);
	});

	it('returns sorted, de-duplicated paths', () => {
		const result = pathsForStory('journal/a');
		expect(result).toEqual([...result].sort());
		expect(new Set(result).size).toBe(result.length);
	});
});
