import { getStoryblokApi } from './storyblok.config';
import { StoryblokService } from './storyblok.service';

jest.mock('./storyblok.config', () => ({
	getStoryblokApi: jest.fn(),
}));

const story = (id: number, displayInOverviewPage = true) => ({
	id,
	slug: `article-${id}`,
	content: { component: 'article', title: `Article ${id}`, displayInOverviewPage },
});

describe('StoryblokService.getPublishedJournalArticles', () => {
	it('requests every published article without the overview visibility filter', async () => {
		const hiddenStory = story(51, false);
		const get = jest.fn().mockResolvedValue({
			data: { stories: [hiddenStory], cv: 1001 },
			perPage: 50,
			total: 1,
		});
		const now = jest.spyOn(Date, 'now').mockReturnValue(1234567890);
		(getStoryblokApi as jest.Mock).mockReturnValue({ get });

		const result = await new StoryblokService({} as never).getPublishedJournalArticles('en');

		expect(result).toEqual({ success: true, data: [hiddenStory] });
		expect(get).toHaveBeenCalledWith(
			'cdn/stories',
			expect.objectContaining({
				language: 'en',
				version: 'published',
				content_type: 'article',
				sort_by: 'first_published_at:desc',
				page: 1,
				cv: 1234567890,
			}),
		);
		const calls = get.mock.calls as unknown as [string, Record<string, unknown>][];
		const firstCallParams = calls[0]?.[1];
		expect(firstCallParams).not.toHaveProperty('filter_query');
		now.mockRestore();
	});

	it('pins every pagination request to the first published content version', async () => {
		const firstPage = Array.from({ length: 50 }, (_, index) => story(51 - index));
		const secondPage = [story(1, false)];
		const get = jest.fn().mockImplementation((_path: string, params: Record<string, unknown>) => {
			if (params.page === 1) {
				return Promise.resolve({ data: { stories: firstPage, cv: 1001 }, perPage: 50, total: 51 });
			}

			return Promise.resolve({ data: { stories: secondPage, cv: 1001 }, perPage: 50, total: 51 });
		});
		const now = jest.spyOn(Date, 'now').mockReturnValue(1234567890);
		(getStoryblokApi as jest.Mock).mockReturnValue({ get });

		const result = await new StoryblokService({} as never).getPublishedJournalArticles('en');

		expect(result).toEqual({ success: true, data: [...firstPage, ...secondPage] });
		expect(get).toHaveBeenCalledTimes(2);
		const calls = get.mock.calls as unknown as [string, Record<string, unknown>][];
		const requestedParams = calls.map((call) => call[1]);
		expect(requestedParams).toEqual([
			expect.objectContaining({ page: 1, cv: 1234567890 }),
			expect.objectContaining({ page: 2, cv: 1001 }),
		]);
		now.mockRestore();
	});

	it('keeps overlapping reads on their own published content versions', async () => {
		let releaseFirstPage: (() => void) | undefined;
		const firstPageHeld = new Promise<void>((resolve) => {
			releaseFirstPage = resolve;
		});
		let firstPageCalls = 0;
		const get = jest.fn().mockImplementation((_path: string, params: Record<string, unknown>) => {
			if (params.page === 1) {
				firstPageCalls += 1;
				const version = firstPageCalls === 1 ? 1001 : 1002;
				const response = {
					data: { stories: [story(version)], cv: version },
					perPage: 1,
					total: 2,
				};

				return version === 1001 ? firstPageHeld.then(() => response) : Promise.resolve(response);
			}

			return Promise.resolve({ data: { stories: [story(params.cv as number)] }, perPage: 1, total: 2 });
		});
		const now = jest.spyOn(Date, 'now').mockReturnValueOnce(1234567890).mockReturnValueOnce(1234567891);
		(getStoryblokApi as jest.Mock).mockReturnValue({ get });

		const firstRead = new StoryblokService({} as never).getPublishedJournalArticles('en');
		await new Promise((resolve) => setImmediate(resolve));
		const secondRead = new StoryblokService({} as never).getPublishedJournalArticles('en');
		const secondResult = await secondRead;
		releaseFirstPage?.();
		const firstResult = await firstRead;

		expect(firstResult).toEqual({ success: true, data: [story(1001), story(1001)] });
		expect(secondResult).toEqual({ success: true, data: [story(1002), story(1002)] });
		const calls = get.mock.calls as unknown as [string, Record<string, unknown>][];
		expect(calls.map((call) => call[1].cv)).toEqual([1234567890, 1234567891, 1002, 1001]);
		now.mockRestore();
	});

	it('uses the offline fixture path in production mode when the mock flag is set', async () => {
		const environment = process.env as Record<string, string | undefined>;
		const originalNodeEnv = environment.NODE_ENV;
		const originalMockFlag = process.env.E2E_STORYBLOK_MOCK;
		const originalToken = process.env.STORYBLOK_PREVIEW_TOKEN;
		const getAll = jest.fn().mockResolvedValue([]);
		(getStoryblokApi as jest.Mock).mockReturnValue({ getAll });
		environment.NODE_ENV = 'production';
		process.env.E2E_STORYBLOK_MOCK = '1';
		process.env.STORYBLOK_PREVIEW_TOKEN = 'synthetic-token';

		try {
			const result = await new StoryblokService({} as never).getPublishedJournalArticles('en');

			expect(result).toEqual({ success: true, data: [] });
			expect(getAll).toHaveBeenCalledWith(
				'cdn/stories',
				expect.objectContaining({ language: 'en', version: 'published', content_type: 'article' }),
			);
		} finally {
			if (originalNodeEnv === undefined) {
				delete environment.NODE_ENV;
			} else {
				environment.NODE_ENV = originalNodeEnv;
			}
			if (originalMockFlag === undefined) {
				delete environment.E2E_STORYBLOK_MOCK;
			} else {
				environment.E2E_STORYBLOK_MOCK = originalMockFlag;
			}
			if (originalToken === undefined) {
				delete environment.STORYBLOK_PREVIEW_TOKEN;
			} else {
				environment.STORYBLOK_PREVIEW_TOKEN = originalToken;
			}
		}
	});
});
