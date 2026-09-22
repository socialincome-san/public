import { mainWebsiteLanguages, websiteRegions } from '@/lib/i18n/utils';
import { pathsForStory } from './storyblok-revalidation';

const localeCount = mainWebsiteLanguages.length * websiteRegions.length;
const aggregatePathCount = 3 * localeCount;
const sitemapCount = 1;

const expectPathsForLocales = (relativePath: string, result: string[]) => {
	const expected = mainWebsiteLanguages.flatMap((language) =>
		websiteRegions.map((region) => `/${language}/${region}${relativePath}`),
	);
	for (const path of expected) {
		expect(result).toContain(path);
	}
};

describe('pathsForStory', () => {
	it.each(['', 'unknown/prefix/foo', 'pages/home'])('includes only aggregate paths and sitemap for %s', (fullSlug) => {
		const result = pathsForStory(fullSlug);
		expect(result).toHaveLength(aggregatePathCount + sitemapCount);
		expectPathsForLocales('', result);
		expectPathsForLocales('/journal', result);
		expectPathsForLocales('/impact-measurement', result);
		expect(result).toContain('/sitemap.xml');
	});

	it.each([
		['pages/about', '/about'],
		['pages/countries/countries', '/countries'],
		['pages/countries/sierra-leone', '/countries/sierra-leone'],
		['pages/focuses/focuses', '/focuses'],
		['pages/focuses/poverty', '/focuses/poverty'],
		['pages/local-partners/local-partners', '/local-partners'],
		['pages/local-partners/acme-ngo', '/local-partners/acme-ngo'],
		['pages/programs/foo', '/programs/foo'],
		['pages/programs/programs', '/programs'],
		['pages/campaigns/campaigns', '/campaigns'],
		['journal/my-article', '/journal/my-article'],
		['pages/journal/my-article', '/journal/my-article'],
		['journal/tag/design', '/journal/tag/design'],
		['tag/design', '/journal/tag/design'],
		['globals/journal/tags/design', '/journal/tag/design'],
		['person/jane-doe', '/person/jane-doe'],
		['pages/persons/jane-doe', '/person/jane-doe'],
	])('maps %s to %s', (fullSlug, relativePath) => {
		const result = pathsForStory(fullSlug);
		expect(result).toHaveLength(aggregatePathCount + localeCount + sitemapCount);
		expectPathsForLocales(relativePath, result);
	});

	it('returns sorted, de-duplicated paths', () => {
		const result = pathsForStory('journal/a');
		expect(result).toEqual([...result].sort());
		expect(new Set(result).size).toBe(result.length);
	});
});
