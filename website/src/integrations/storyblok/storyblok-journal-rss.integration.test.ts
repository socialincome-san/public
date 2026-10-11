const mockGet = jest.fn();
const mockStoryblokClient = jest.fn().mockImplementation(() => ({ get: mockGet, getAll: jest.fn() }));

jest.mock('@storyblok/js', () => ({
	StoryblokClient: mockStoryblokClient,
	apiPlugin: {},
	storyblokInit: jest.fn(),
}));

import { fetchPublishedStoryblokArticles } from './storyblok-content.integration';

type StoryblokRequestParams = {
	[key: string]: unknown;
	page?: number;
	cv?: number;
};

describe('fetchPublishedStoryblokArticles', () => {
	const params = {
		language: 'en',
		version: 'published' as const,
		content_type: 'article',
		per_page: 50,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.STORYBLOK_PREVIEW_TOKEN = 'synthetic-token';
		delete process.env.E2E_STORYBLOK_MOCK;
	});

	afterAll(() => {
		delete process.env.STORYBLOK_PREVIEW_TOKEN;
	});

	it('pins all pages to the first published content version with an isolated no-cache client', async () => {
		const firstStories = Array.from({ length: 50 }, (_, index) => ({ id: index + 1 }));
		mockGet
			.mockResolvedValueOnce({ data: { stories: firstStories, cv: 101 }, perPage: 50, total: 51 })
			.mockResolvedValueOnce({ data: { stories: [{ id: 51 }], cv: 101 }, perPage: 50, total: 51 });
		const now = jest.spyOn(Date, 'now').mockReturnValue(1234567890);

		await expect(fetchPublishedStoryblokArticles(params)).resolves.toEqual({
			success: true,
			data: [...firstStories, { id: 51 }],
		});

		expect(mockStoryblokClient).toHaveBeenCalledWith(
			expect.objectContaining({
				accessToken: 'journal-rss:synthetic-token',
				cache: { type: 'none', cv: 'manual' },
			}),
		);
		const requests = mockGet.mock.calls as unknown as [string, StoryblokRequestParams][];
		expect(requests[0]?.[1]).toEqual(
			expect.objectContaining({ language: 'en', version: 'published', content_type: 'article' }),
		);
		expect(requests[0]?.[1]).not.toHaveProperty('filter_query');
		expect(requests.map(([, requestParams]) => requestParams)).toEqual([
			expect.objectContaining({ page: 1, cv: 1234567890 }),
			expect.objectContaining({ page: 2, cv: 101 }),
		]);
		now.mockRestore();
	});

	it('keeps overlapping reads on separate snapshots', async () => {
		let releaseFirst: (() => void) | undefined;
		const firstHeld = new Promise<void>((resolve) => {
			releaseFirst = resolve;
		});
		let firstPageCalls = 0;
		mockGet.mockImplementation((_path: string, requestParams: { page?: number; cv?: number }) => {
			if (requestParams.page === 1) {
				firstPageCalls += 1;
				const version = firstPageCalls === 1 ? 101 : 102;
				const response = { data: { stories: [{ id: version }], cv: version }, perPage: 1, total: 2 };

				return version === 101 ? firstHeld.then(() => response) : Promise.resolve(response);
			}

			return Promise.resolve({
				data: { stories: [{ id: requestParams.cv }], cv: requestParams.cv ?? 0 },
				perPage: 1,
				total: 2,
			});
		});
		const now = jest.spyOn(Date, 'now').mockReturnValueOnce(1234567890).mockReturnValueOnce(1234567891);

		const first = fetchPublishedStoryblokArticles(params);
		await new Promise((resolve) => setImmediate(resolve));
		const second = fetchPublishedStoryblokArticles(params);
		await expect(second).resolves.toEqual({ success: true, data: [{ id: 102 }, { id: 102 }] });
		releaseFirst?.();
		await expect(first).resolves.toEqual({ success: true, data: [{ id: 101 }, { id: 101 }] });
		now.mockRestore();
	});

	it('uses the offline fixture before requiring a token or constructing a transport client', async () => {
		process.env.E2E_STORYBLOK_MOCK = '1';
		delete process.env.STORYBLOK_PREVIEW_TOKEN;

		await expect(fetchPublishedStoryblokArticles(params)).resolves.toEqual({ success: true, data: [] });
		expect(mockStoryblokClient).not.toHaveBeenCalled();

		delete process.env.E2E_STORYBLOK_MOCK;
	});
});
