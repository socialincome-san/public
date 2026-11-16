import { getPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.cache';
import { getPublishedNestedSlugParams, getPublishedSlugParams } from './published-slug-params';

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({ getPublishedPageLinks: jest.fn() }));

const page = (slug: string) => ({ uuid: slug, slug, is_folder: false, published: true });

beforeEach(() => {
	jest.mocked(getPublishedPageLinks).mockResolvedValue({
		success: true,
		data: [
			page('pages/about-us'),
			page('pages/get-involved/individuals/donate'),
			page('pages/get-involved/ngos/start-a-program'),
			page('pages/get-involved/companies/events/talks'),
			page('pages/programs/craftspeople'),
			page('pages/persons/jane-doe'),
			{ ...page('pages/get-involved/companies/donate'), published: false },
		],
	});
});

describe('getPublishedNestedSlugParams', () => {
	test('lists published content pages in folders of any depth', async () => {
		expect(await getPublishedNestedSlugParams()).toEqual([
			{ slug: 'get-involved', path: ['individuals', 'donate'] },
			{ slug: 'get-involved', path: ['ngos', 'start-a-program'] },
			{ slug: 'get-involved', path: ['companies', 'events', 'talks'] },
		]);
	});

	test('returns a placeholder without pages', async () => {
		jest.mocked(getPublishedPageLinks).mockResolvedValue({ success: true, data: [] });

		expect(await getPublishedNestedSlugParams()).toEqual([
			{ slug: '__no-published-slugs__', path: ['__no-published-slugs__'] },
		]);
	});
});

describe('getPublishedSlugParams', () => {
	test('leaves out nested pages', async () => {
		expect(await getPublishedSlugParams()).toEqual([{ slug: 'about-us' }]);
	});
});
