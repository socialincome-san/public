import { getLatestPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.service';
import { readdirSync } from 'fs';
import path from 'path';

jest.mock('@/modules/storyblok-content/storyblok-content.service', () => ({ getLatestPublishedPageLinks: jest.fn() }));

const page = (slug: string) => ({ uuid: slug, slug, is_folder: false, published: true });

const WEBSITE_APP_DIR = path.join(__dirname, '../app/[lang]/[currency]');

const getRoutePatterns = () =>
	readdirSync(WEBSITE_APP_DIR, { recursive: true, encoding: 'utf8' })
		.filter((file) => /(^|\/)(page|route)\.(tsx?|jsx?|mdx)$/.test(file))
		.map((file) => path.dirname(file).replace(/(^|\/)\([^/]+\)(?=\/|$)/g, ''))
		.map((pattern) => pattern.replace(/^\//, ''))
		.map((pattern) => (pattern === '.' ? '' : pattern));

// Each test gets a fresh module, because the published paths are kept in module state
const loadModule = () => {
	let loaded: typeof import('./missing-website-page') | undefined;
	jest.isolateModules(() => {
		loaded = jest.requireActual<typeof import('./missing-website-page')>('./missing-website-page');
	});
	if (!loaded) {
		throw new Error('Could not load the module');
	}

	return loaded;
};

describe('isStoryblokPagePath', () => {
	test('covers exactly the [slug] routes of the app folder, except previews', () => {
		const { isStoryblokPagePath } = loadModule();
		const patterns = getRoutePatterns();

		expect(patterns).toContain('[slug]/[...path]');
		for (const pattern of patterns) {
			const samplePath = pattern.replace(/\[(\.\.\.)?([^\]]+)\]/g, 'sample');
			const isSlugRoute = pattern.includes('[slug]') && !pattern.endsWith('preview');

			expect({ pattern, checked: isStoryblokPagePath(samplePath) }).toEqual({ pattern, checked: isSlugRoute });
		}
	});
});

describe('isMissingWebsitePage', () => {
	const waitUntil = jest.fn<void, [Promise<unknown>]>();

	beforeEach(() => {
		jest.replaceProperty(process, 'env', { ...process.env, NODE_ENV: 'production' });
		jest.mocked(getLatestPublishedPageLinks).mockReset();
		jest.mocked(getLatestPublishedPageLinks).mockResolvedValue({
			success: true,
			data: [page('pages/mission'), page('pages/journal/cash-works'), page('pages/persons/jane-doe')],
		});
	});

	afterEach(() => {
		waitUntil.mockClear();
		jest.restoreAllMocks();
		jest.useRealTimers();
	});

	test('reports only paths without a published page', async () => {
		const { isMissingWebsitePage } = loadModule();

		expect(await isMissingWebsitePage('mission', waitUntil)).toBe(false);
		expect(await isMissingWebsitePage('journal/cash-works', waitUntil)).toBe(false);
		expect(await isMissingWebsitePage('person/jane-doe', waitUntil)).toBe(false);
		expect(await isMissingWebsitePage('xyz-not-a-page-123', waitUntil)).toBe(true);
		expect(await isMissingWebsitePage('pages/transparency', waitUntil)).toBe(true);
		expect(await isMissingWebsitePage('journal/xyz', waitUntil)).toBe(true);
		expect(getLatestPublishedPageLinks).toHaveBeenCalledTimes(1);
	});

	test('never reports routes that are not Storyblok pages', async () => {
		const { isMissingWebsitePage } = loadModule();

		expect(await isMissingWebsitePage('', waitUntil)).toBe(false);
		expect(await isMissingWebsitePage('dashboard/profile', waitUntil)).toBe(false);
		expect(await isMissingWebsitePage('xyz-not-a-page-123/preview', waitUntil)).toBe(false);
		expect(getLatestPublishedPageLinks).not.toHaveBeenCalled();
	});

	test('leaves the decision to the page when the list fails or is empty', async () => {
		const { isMissingWebsitePage } = loadModule();
		jest.mocked(getLatestPublishedPageLinks).mockResolvedValueOnce({ success: false, error: 'failed' });

		expect(await isMissingWebsitePage('xyz-not-a-page-123', waitUntil)).toBe(false);

		const { isMissingWebsitePage: isMissingWithoutLinks } = loadModule();
		jest.mocked(getLatestPublishedPageLinks).mockResolvedValueOnce({ success: true, data: [] });

		expect(await isMissingWithoutLinks('xyz-not-a-page-123', waitUntil)).toBe(false);
	});

	test('finds a page published a moment ago before answering 404', async () => {
		jest.useFakeTimers();
		const { isMissingWebsitePage } = loadModule();

		expect(await isMissingWebsitePage('new-page', waitUntil)).toBe(true);

		jest.mocked(getLatestPublishedPageLinks).mockResolvedValue({ success: true, data: [page('pages/new-page')] });
		jest.advanceTimersByTime(11_000);

		expect(await isMissingWebsitePage('new-page', waitUntil)).toBe(false);
		expect(getLatestPublishedPageLinks).toHaveBeenCalledTimes(2);
	});

	test('asks Storyblok at most once per interval for unknown paths', async () => {
		jest.useFakeTimers();
		const { isMissingWebsitePage } = loadModule();

		expect(await isMissingWebsitePage('junk-1', waitUntil)).toBe(true);
		jest.advanceTimersByTime(9_000);
		expect(await isMissingWebsitePage('junk-2', waitUntil)).toBe(true);
		expect(
			await Promise.all([isMissingWebsitePage('junk-3', waitUntil), isMissingWebsitePage('junk-4', waitUntil)]),
		).toEqual([true, true]);

		expect(getLatestPublishedPageLinks).toHaveBeenCalledTimes(1);
	});

	test('refreshes in the background for known pages and then drops an unpublished one', async () => {
		jest.useFakeTimers();
		const { isMissingWebsitePage } = loadModule();

		expect(await isMissingWebsitePage('mission', waitUntil)).toBe(false);
		expect(waitUntil).not.toHaveBeenCalled();

		jest.mocked(getLatestPublishedPageLinks).mockResolvedValue({ success: true, data: [page('pages/other')] });
		jest.advanceTimersByTime(61_000);

		expect(await isMissingWebsitePage('mission', waitUntil)).toBe(false);
		expect(waitUntil).toHaveBeenCalledTimes(1);
		await waitUntil.mock.lastCall?.[0];
		expect(await isMissingWebsitePage('mission', waitUntil)).toBe(true);
	});

	test('passes everything through after a failed refresh until one succeeds again', async () => {
		jest.useFakeTimers();
		const { isMissingWebsitePage } = loadModule();

		expect(await isMissingWebsitePage('xyz-not-a-page-123', waitUntil)).toBe(true);

		jest.mocked(getLatestPublishedPageLinks).mockResolvedValue({ success: false, error: 'failed' });
		jest.advanceTimersByTime(11_000);

		expect(await isMissingWebsitePage('xyz-not-a-page-123', waitUntil)).toBe(false);
		expect(await isMissingWebsitePage('mission', waitUntil)).toBe(false);

		jest.mocked(getLatestPublishedPageLinks).mockResolvedValue({ success: true, data: [] });
		jest.advanceTimersByTime(11_000);

		expect(await isMissingWebsitePage('xyz-not-a-page-123', waitUntil)).toBe(false);
		expect(waitUntil).toHaveBeenCalledTimes(1);
		await waitUntil.mock.lastCall?.[0];
		expect(await isMissingWebsitePage('xyz-not-a-page-123', waitUntil)).toBe(false);

		jest.mocked(getLatestPublishedPageLinks).mockResolvedValue({ success: true, data: [page('pages/mission')] });
		jest.advanceTimersByTime(11_000);

		expect(await isMissingWebsitePage('xyz-not-a-page-123', waitUntil)).toBe(false);
		await waitUntil.mock.lastCall?.[0];
		expect(await isMissingWebsitePage('xyz-not-a-page-123', waitUntil)).toBe(true);
		expect(await isMissingWebsitePage('mission', waitUntil)).toBe(false);
	});

	test('does nothing outside production, where unpublished pages render from their draft', async () => {
		jest.replaceProperty(process, 'env', { ...process.env, NODE_ENV: 'development' });
		const { isMissingWebsitePage } = loadModule();

		expect(await isMissingWebsitePage('xyz-not-a-page-123', waitUntil)).toBe(false);
		expect(getLatestPublishedPageLinks).not.toHaveBeenCalled();
	});
});
