import { getPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.cache';
import type { StoryblokPublishedLink } from '@/modules/storyblok-content/storyblok-content.types';
import { findPathTails, getLinkPathTails, getPageMetadata } from './page-metadata';

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({ getPublishedPageLinks: jest.fn() }));
jest.mock('next-intl/server', () => ({
	getMessages: () =>
		Promise.resolve({ 'website-common': { metadata: { title: 'Social Income', description: 'Description' } } }),
}));

const homeLink: StoryblokPublishedLink = {
	uuid: 'home',
	slug: 'pages/home',
	is_folder: false,
	published: true,
	alternates: [
		{ lang: 'de', path: '', name: null, published: true, translated_slug: 'pages/home' },
		{ lang: 'fr', path: '', name: null, published: false, translated_slug: 'pages/home' },
		{ lang: 'it', path: '', name: null, published: null, translated_slug: 'pages/home' },
	],
};

describe('getLinkPathTails', () => {
	it('keeps the home page, whose path tail is empty', () => {
		expect(getLinkPathTails(homeLink)).toEqual(
			new Map([
				['en', ''],
				['de', ''],
			]),
		);
	});
});

describe('findPathTails', () => {
	it('lists only the published translations of the home page', () => {
		expect([...findPathTails([homeLink], '').keys()]).toEqual(['en', 'de']);
	});
});

describe('getPageMetadata', () => {
	beforeEach(() => {
		jest.mocked(getPublishedPageLinks).mockResolvedValue({ success: true, data: [homeLink] });
	});

	it('names only the published translations and x-default in hreflang', async () => {
		const { alternates } = await getPageMetadata('en', '', {});

		expect(alternates?.languages).toEqual({ en: '/en/usd', de: '/de/usd', 'x-default': '/en/usd' });
	});

	it('renders the same hreflang set on every language, with the fallback as canonical of an unpublished one', async () => {
		const english = await getPageMetadata('en', '', {});
		const german = await getPageMetadata('de', '', {});
		const french = await getPageMetadata('fr', '', {});

		expect(german.alternates?.languages).toEqual(english.alternates?.languages);
		expect(french.alternates?.languages).toEqual(english.alternates?.languages);
		expect(german.alternates?.canonical).toBe('/de/usd');
		expect(french.alternates?.canonical).toBe('/en/usd');
	});
});
