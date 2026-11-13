import type { CountryStory } from '@/components/storyblok/country/country.types';
import type { AfricaMap as AfricaMapBlok } from '@/generated/storyblok/types/109655/storyblok-components';
import { resultFail, resultOk } from '@/lib/result';
import { getPublicCountryStatsByIsoCodesAction } from '@/modules/countries/country.actions';
import { getCountriesAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { AfricaMap } from '@socialincome/design-system/data-display/africa-map/africa-map';
import { renderToStaticMarkup } from 'react-dom/server';
import { AfricaMapBlock } from './africa-map';

jest.mock('@/modules/storyblok-content/storyblok-content.actions', () => ({
	getCountriesAction: jest.fn(),
}));

jest.mock('@/modules/countries/country.actions', () => ({
	getPublicCountryStatsByIsoCodesAction: jest.fn(),
}));

jest.mock('@socialincome/design-system/data-display/africa-map/africa-map', () => ({
	AfricaMap: jest.fn(() => null),
}));

jest.mock('@storyblok/react', () => ({
	storyblokEditable: jest.fn(() => ({})),
}));

jest.mock('next-intl/server', () => ({
	getTranslations: jest.fn((namespace: string) =>
		Promise.resolve((key: string, values?: { count: number }) => `${namespace}:${key}${values ? ` ${values.count}` : ''}`),
	),
}));

const countryPage = (isoCode: string, title: string, slug: string) =>
	({
		uuid: slug,
		slug,
		full_slug: `pages/countries/${slug}`,
		content: { isoCode, title, component: 'Country', _uid: slug },
	}) as CountryStory;

const renderBlock = async (fields: Partial<AfricaMapBlok>) => {
	const blok: AfricaMapBlok = { component: 'africaMap', _uid: 'map', ...fields };
	renderToStaticMarkup(await AfricaMapBlock({ blok, lang: 'de', currency: 'CHF' }));

	return jest.mocked(AfricaMap).mock.calls[0]?.[0];
};

beforeEach(() => {
	jest.clearAllMocks();
	jest.mocked(getCountriesAction).mockResolvedValue(resultOk([countryPage('sl', 'Sierra Leone', 'sierra-leone')]));
	jest.mocked(getPublicCountryStatsByIsoCodesAction).mockResolvedValue(resultOk({}));
});

test('links the countries that have a page and names the others in the language of the visitor', async () => {
	const props = await renderBlock({ countries: ['sl', 'ke'] });

	expect(props?.countries).toEqual([
		{ code: 'SL', name: 'Sierra Leone', href: '/de/chf/countries/sierra-leone' },
		{ code: 'KE', name: 'countries:KE', href: undefined },
	]);
	expect(props?.label).toBe('website-common:africa-map.label');
});

test('tells how many recipients each country has, unless it has none yet', async () => {
	jest
		.mocked(getPublicCountryStatsByIsoCodesAction)
		.mockResolvedValue(
			resultOk({ SL: { programsCount: 2, recipientsCount: 1250 }, KE: { programsCount: 0, recipientsCount: 0 } }),
		);

	const props = await renderBlock({ countries: ['sl', 'ke', 'lr'] });

	expect(getPublicCountryStatsByIsoCodesAction).toHaveBeenCalledWith(['SL', 'KE', 'LR']);
	expect(props?.countries.map(({ detail }) => detail)).toEqual([
		'website-common:africa-map.recipients 1250',
		undefined,
		undefined,
	]);
});

test('skips values that are not country codes and still shows the map without country pages or numbers', async () => {
	jest.mocked(getCountriesAction).mockResolvedValue(resultFail('Storyblok is down'));
	jest.mocked(getPublicCountryStatsByIsoCodesAction).mockResolvedValue(resultFail('Could not load country stats map'));

	const props = await renderBlock({ countries: ['sl', '', 'not-a-country'] });

	expect(props?.countries).toEqual([{ code: 'SL', name: 'countries:SL', href: undefined, detail: undefined }]);
});

test('takes the page margins on a page and sits in the text column of an article, which a wide map leaves', async () => {
	const markup = async (placement: 'page' | 'article', wide?: boolean) =>
		renderToStaticMarkup(
			await AfricaMapBlock({ blok: { component: 'africaMap', _uid: 'map', wide }, lang: 'de', currency: 'CHF', placement }),
		);

	expect(await markup('page')).toContain('max-w-2xl');
	expect(await markup('page', true)).toContain('max-w-[800px]');
	expect(await markup('article')).toBe('<div class="not-prose my-8"></div>');
	expect(await markup('article', true)).toContain('lg:max-w-[800px]');
});

test('passes the map options on and leaves unset ones to the defaults of the map', async () => {
	expect(await renderBlock({ mapColor: '', highlightColor: '', shadedRegion: '', zoom: '' })).toMatchObject({
		appearance: undefined,
		highlightColor: undefined,
		shadedRegion: undefined,
		zoom: undefined,
	});

	jest.clearAllMocks();
	expect(
		await renderBlock({
			mapColor: 'satellite',
			highlightColor: 'yellow',
			clouds: true,
			shadedRegion: 'subSaharan',
			zoom: 'western',
		}),
	).toMatchObject({
		appearance: 'satellite',
		highlightColor: 'yellow',
		clouds: true,
		shadedRegion: 'subSaharan',
		zoom: 'western',
	});
});
