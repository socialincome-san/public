import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { getCampaignStoryPath } from '@/lib/storyblok/storyblok-paths';
import { StoryblokManagementService } from './storyblok-management.service';

describe('StoryblokManagementService.listCampaignDefaultImages', () => {
	const originalFetch = global.fetch;

	afterEach(() => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	test('returns at most maxCampaignDefaultImages assets', async () => {
		process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';

		const assets = Array.from({ length: 8 }, (_, index) => ({
			id: index + 1,
			filename: `https://a.storyblok.com/f/109655/image-${index + 1}.png`,
			content_type: 'image/png',
			asset_folder_id: campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId,
		}));

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(JSON.stringify({ assets })),
		}) as typeof fetch;

		const service = new StoryblokManagementService();
		const result = await service.listCampaignDefaultImages();

		expect(result).toHaveLength(campaignSubmissionConfig.maxCampaignDefaultImages);
		expect(result.map((asset) => asset.id)).toEqual([1, 2, 3, 4, 5]);
	});
});

describe('StoryblokManagementService.campaignStoryExists', () => {
	const originalFetch = global.fetch;

	afterEach(() => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	test('returns true when a campaign story already uses the slug', async () => {
		process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';
		const slug = 'meine-kampagne';
		const storyPath = getCampaignStoryPath(slug);
		const fetchMock = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () =>
				Promise.resolve(
					JSON.stringify({
						stories: [{ slug, full_slug: storyPath, is_folder: false }],
					}),
				),
		});
		global.fetch = fetchMock as typeof fetch;

		const service = new StoryblokManagementService();
		const exists = await service.campaignStoryExists(slug);

		expect(exists).toBe(true);
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining(`with_slug=${encodeURIComponent(storyPath)}`),
			expect.objectContaining({ method: 'GET' }),
		);
	});

	test('returns false when no matching campaign story exists', async () => {
		process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(JSON.stringify({ stories: [] })),
		}) as typeof fetch;

		const service = new StoryblokManagementService();

		await expect(service.campaignStoryExists('meine-kampagne')).resolves.toBe(false);
	});

	test('returns false when the only matching story is a folder', async () => {
		process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';
		const slug = 'meine-kampagne';
		const storyPath = getCampaignStoryPath(slug);
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () =>
				Promise.resolve(
					JSON.stringify({
						stories: [{ slug, full_slug: storyPath, is_folder: true }],
					}),
				),
		}) as typeof fetch;

		const service = new StoryblokManagementService();

		await expect(service.campaignStoryExists(slug)).resolves.toBe(false);
	});

	test('returns false when the Storyblok payload has no stories array', async () => {
		process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(JSON.stringify({})),
		}) as typeof fetch;

		const service = new StoryblokManagementService();

		await expect(service.campaignStoryExists('meine-kampagne')).resolves.toBe(false);
	});
});

describe('StoryblokManagementService.downloadAssetBuffer', () => {
	const originalFetch = global.fetch;
	const allowedUrl = 'https://a.storyblok.com/f/109655/default.png';

	afterEach(() => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	test('downloads allowed Storyblok CDN assets with redirect disabled', async () => {
		const payload = Buffer.from('png-bytes');
		const fetchMock = jest.fn().mockResolvedValue(
			new Response(payload, {
				status: 200,
				headers: { 'content-length': String(payload.byteLength) },
			}),
		);
		global.fetch = fetchMock as typeof fetch;

		const service = new StoryblokManagementService();
		const result = await service.downloadAssetBuffer(allowedUrl);

		expect(result.equals(payload)).toBe(true);
		expect(fetchMock).toHaveBeenCalledWith(
			allowedUrl,
			expect.objectContaining({
				method: 'GET',
				redirect: 'error',
			}),
		);
	});

	test.each([
		['http://a.storyblok.com/f/109655/default.png', 'Storyblok asset URL must use HTTPS.'],
		['https://evil.example.com/f/109655/default.png', 'Storyblok asset URL host is not allowed.'],
		['https://storyblok.com.evil.com/f/109655/default.png', 'Storyblok asset URL host is not allowed.'],
		['https://user:pass@a.storyblok.com/f/109655/default.png', 'Storyblok asset URL must not include credentials.'],
		['not-a-url', 'Invalid Storyblok asset URL.'],
	])('rejects unsafe asset URL %s', async (filename, message) => {
		const fetchMock = jest.fn();
		global.fetch = fetchMock as typeof fetch;

		const service = new StoryblokManagementService();
		await expect(service.downloadAssetBuffer(filename)).rejects.toEqual(
			expect.objectContaining({
				name: 'StoryblokManagementError',
				message,
				statusCode: 400,
				retryable: false,
			}),
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test('rejects oversized Content-Length before buffering', async () => {
		const fetchMock = jest.fn().mockResolvedValue(
			new Response(null, {
				status: 200,
				headers: { 'content-length': String(campaignSubmissionConfig.maxImageBytes + 1) },
			}),
		);
		global.fetch = fetchMock as typeof fetch;

		const service = new StoryblokManagementService();
		await expect(service.downloadAssetBuffer(allowedUrl)).rejects.toMatchObject({
			name: 'StoryblokManagementError',
			message: 'Storyblok asset exceeds size limit.',
			statusCode: 413,
			retryable: false,
		});
	});

	test('rejects streams that exceed maxImageBytes without Content-Length', async () => {
		const oversized = Buffer.alloc(campaignSubmissionConfig.maxImageBytes + 1, 1);
		const fetchMock = jest.fn().mockResolvedValue(new Response(oversized, { status: 200 }));
		global.fetch = fetchMock as typeof fetch;

		const service = new StoryblokManagementService();
		await expect(service.downloadAssetBuffer(allowedUrl)).rejects.toMatchObject({
			name: 'StoryblokManagementError',
			message: 'Storyblok asset exceeds size limit.',
			statusCode: 413,
			retryable: false,
		});
	});
});
