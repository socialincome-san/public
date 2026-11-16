const mockGetAll = jest.fn();
const mockStoryblokClient = jest.fn().mockImplementation(() => ({ get: jest.fn(), getAll: mockGetAll }));

jest.mock('@storyblok/js', () => ({
	StoryblokClient: mockStoryblokClient,
	apiPlugin: {},
	storyblokInit: jest.fn(),
}));

import { fetchLatestPublishedStoryblokLinks } from './storyblok-content.integration';

describe('fetchLatestPublishedStoryblokLinks', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.STORYBLOK_PREVIEW_TOKEN = 'synthetic-token';
		delete process.env.E2E_STORYBLOK_MOCK;
	});

	afterAll(() => {
		delete process.env.STORYBLOK_PREVIEW_TOKEN;
	});

	it('reads the published links past any tracked content version, with a timeout', async () => {
		const links = [{ slug: 'pages/mission' }];
		mockGetAll.mockResolvedValueOnce(links);
		const now = jest.spyOn(Date, 'now').mockReturnValue(1234567890);

		await expect(fetchLatestPublishedStoryblokLinks({ starts_with: 'pages/' })).resolves.toEqual({
			success: true,
			data: links,
		});

		expect(mockStoryblokClient).toHaveBeenCalledWith(
			expect.objectContaining({
				accessToken: 'published-links:synthetic-token',
				cache: { type: 'none', cv: 'manual' },
				timeout: 3,
			}),
		);
		expect(mockGetAll).toHaveBeenCalledWith('cdn/links', {
			starts_with: 'pages/',
			version: 'published',
			per_page: 1000,
			cv: 1234567890,
		});
		now.mockRestore();
	});

	it('fails without throwing when Storyblok does not answer', async () => {
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		mockGetAll.mockRejectedValueOnce(new Error('aborted'));

		await expect(fetchLatestPublishedStoryblokLinks({ starts_with: 'pages/' })).resolves.toEqual(
			expect.objectContaining({ success: false }),
		);
	});

	it('fails when the token is missing', async () => {
		delete process.env.STORYBLOK_PREVIEW_TOKEN;

		await expect(fetchLatestPublishedStoryblokLinks({ starts_with: 'pages/' })).resolves.toEqual(
			expect.objectContaining({ success: false }),
		);
		expect(mockStoryblokClient).not.toHaveBeenCalled();
	});
});
