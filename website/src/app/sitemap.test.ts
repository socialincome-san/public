import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { mainWebsiteLanguages, type WebsiteLanguage } from '@/lib/i18n/utils';
import { WEBSITE_ORIGIN } from '@/lib/utils/metadata-image';
import { getCampaigns, getPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.cache';
import type { StoryblokPublishedLink } from '@/modules/storyblok-content/storyblok-content.types';
import sitemap from './sitemap';

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({
	getPublishedPageLinks: jest.fn(),
	getCampaigns: jest.fn(),
}));
jest.mock('next-intl/server', () => ({
	getMessages: () =>
		Promise.resolve({ 'website-common': { metadata: { title: 'Social Income', description: 'Description' } } }),
}));

type Translations = Partial<Record<WebsiteLanguage, string | false>>;

// A translation is a slug when published and false when not. Storyblok lists them in its own order.
const page = (slug: string, translations: Translations = { fr: slug, it: slug, de: slug }): StoryblokPublishedLink => ({
	uuid: slug,
	slug,
	is_folder: false,
	published: true,
	alternates: Object.entries(translations).map(([lang, translatedSlug]) => ({
		lang,
		path: '',
		name: null,
		published: translatedSlug !== false,
		translated_slug: translatedSlug || slug,
	})),
});

const links: StoryblokPublishedLink[] = [
	page('pages/home'),
	page('pages/about', { de: 'pages/about', fr: false, it: false }),
	page('pages/journal/dad', { de: 'pages/journal/Länder', fr: false, it: false }),
	page('pages/journal/english-only', { de: false, fr: false, it: false }),
	page('pages/persons/jane'),
	page('pages/campaigns/campaigns'),
	page('pages/campaigns/listed', { de: 'pages/campaigns/listed', fr: false, it: false }),
	page('pages/campaigns/unlisted'),
	{ uuid: 'folder', slug: 'pages/journal', is_folder: true, published: false },
	{ ...page('pages/draft'), published: false },
];

const url = (path: string) => `${WEBSITE_ORIGIN}${path}`;

const getSitemap = async () => {
	jest.mocked(getPublishedPageLinks).mockResolvedValue({ success: true, data: links });
	jest.mocked(getCampaigns).mockResolvedValue({
		success: true,
		// Only the slug is read
		data: [{ slug: 'listed', full_slug: 'pages/campaigns/listed' }] as never,
	});

	return sitemap();
};

const getAlternates = (entry: Awaited<ReturnType<typeof sitemap>>[number]): Partial<Record<string, string>> =>
	entry.alternates?.languages ?? {};

// "/de/usd/about" → ['de', 'about']
const splitPath = (entryUrl: string): [WebsiteLanguage, string] => {
	const [, lang, , ...pathTail] = new URL(entryUrl).pathname.split('/');
	const language = mainWebsiteLanguages.find((candidate) => candidate === lang);
	if (!language) {
		throw new Error(`Unexpected language in ${entryUrl}`);
	}

	return [language, decodeURIComponent(pathTail.join('/'))];
};

describe('sitemap', () => {
	it('lists every loc once', async () => {
		const locs = (await getSitemap()).map((entry) => entry.url);

		expect(new Set(locs).size).toBe(locs.length);
	});

	it('lists a URL per published language, on the canonical currency', async () => {
		const locs = (await getSitemap()).map((entry) => entry.url);

		expect(locs).toEqual(
			[
				...['/en/usd', '/de/usd', '/fr/usd', '/it/usd'],
				...['/en/usd/about', '/de/usd/about'],
				...['/en/usd/campaigns', '/de/usd/campaigns', '/fr/usd/campaigns', '/it/usd/campaigns'],
				...['/en/usd/campaigns/listed', '/de/usd/campaigns/listed'],
				...['/en/usd/journal', '/de/usd/journal', '/fr/usd/journal', '/it/usd/journal'],
				'/en/usd/journal/dad',
				'/en/usd/journal/english-only',
				'/de/usd/journal/L%C3%A4nder',
				...['/en/usd/open-research/country-eligibility', '/de/usd/open-research/country-eligibility'],
				...['/fr/usd/open-research/country-eligibility', '/it/usd/open-research/country-eligibility'],
				...['/en/usd/person/jane', '/de/usd/person/jane', '/fr/usd/person/jane', '/it/usd/person/jane'],
			].map(url),
		);
	});

	it('gives every entry a reciprocal alternate set with x-default and the entry itself', async () => {
		const entries = await getSitemap();
		const alternatesByLoc = new Map(entries.map((entry) => [entry.url, getAlternates(entry)]));

		for (const [loc, alternates] of alternatesByLoc) {
			const [lang] = splitPath(loc);

			expect(alternates[lang]).toBe(loc);
			expect(alternates['x-default']).toBe(alternates.en);
			for (const alternateUrl of Object.values(alternates)) {
				expect(alternatesByLoc.get(String(alternateUrl))).toEqual(alternates);
			}
		}
	});

	it('names neither the URL nor the alternate of an unpublished translation', async () => {
		const entries = await getSitemap();
		const locs = entries.map((entry) => entry.url);
		const about = entries.find((entry) => entry.url === url('/en/usd/about'));
		const dad = entries.find((entry) => entry.url === url('/en/usd/journal/dad'));

		expect(locs).not.toContain(url('/fr/usd/about'));
		expect(locs).not.toContain(url('/it/usd/about'));
		expect(about && getAlternates(about)).toEqual({
			en: url('/en/usd/about'),
			de: url('/de/usd/about'),
			'x-default': url('/en/usd/about'),
		});
		expect(locs).not.toContain(url('/de/usd/journal/dad'));
		expect(dad && getAlternates(dad)).toEqual({
			en: url('/en/usd/journal/dad'),
			de: url('/de/usd/journal/L%C3%A4nder'),
			'x-default': url('/en/usd/journal/dad'),
		});
	});

	it('leaves out drafts, folders and unlisted campaigns', async () => {
		const locs = (await getSitemap()).map((entry) => entry.url);

		expect(locs).not.toContain(url('/en/usd/draft'));
		expect(locs).not.toContain(url('/en/usd/campaigns/unlisted'));
	});

	it('matches the canonical and hreflang tags in the head of every listed page', async () => {
		for (const entry of await getSitemap()) {
			const { alternates } = await getPageMetadata(...splitPath(entry.url), {});
			const resolve = (path: unknown) => new URL(String(path), WEBSITE_ORIGIN).href;

			expect(resolve(alternates?.canonical)).toBe(entry.url);
			expect(Object.fromEntries(Object.entries(alternates?.languages ?? {}).map(([k, v]) => [k, resolve(v)]))).toEqual(
				getAlternates(entry),
			);
		}
	});

	it('is empty when the links cannot be loaded', async () => {
		jest.mocked(getPublishedPageLinks).mockResolvedValue({ success: false, error: 'Failed' });
		jest.spyOn(console, 'error').mockImplementation(() => undefined);

		expect(await sitemap()).toEqual([]);
	});
});
