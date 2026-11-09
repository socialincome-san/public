import { getPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.cache';
import { getPublishedFolderSlugParams, getPublishedSlugParams } from './published-slug-params';

jest.mock('@/modules/storyblok-content/storyblok-content.cache', () => ({ getPublishedPageLinks: jest.fn() }));

const page = (slug: string) => ({ uuid: slug, slug, is_folder: false, published: true });

beforeEach(() => {
	jest.mocked(getPublishedPageLinks).mockResolvedValue({
		success: true,
		data: [
			page('pages/about-us'),
			page('pages/get-involved/individuals/donate'),
			page('pages/get-involved/ngos/start-a-program'),
			page('pages/get-involved/too/deep/page'),
			{ ...page('pages/get-involved/companies/donate'), published: false },
		],
	});
});

describe('getPublishedFolderSlugParams', () => {
	test('lists published pages exactly one folder below the parent', async () => {
		expect(await getPublishedFolderSlugParams('get-involved')).toEqual([
			{ folder: 'individuals', slug: 'donate' },
			{ folder: 'ngos', slug: 'start-a-program' },
		]);
	});

	test('returns a placeholder without pages', async () => {
		jest.mocked(getPublishedPageLinks).mockResolvedValue({ success: true, data: [] });

		expect(await getPublishedFolderSlugParams('get-involved')).toEqual([
			{ folder: '__no-published-slugs__', slug: '__no-published-slugs__' },
		]);
	});
});

describe('getPublishedSlugParams', () => {
	test('leaves out nested pages', async () => {
		expect(await getPublishedSlugParams()).toEqual([{ slug: 'about-us' }]);
	});
});
