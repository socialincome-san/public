import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { getCampaignStoryPath } from '@/lib/storyblok/storyblok-paths';
import {
	campaignStoryExists,
	downloadStoryblokAssetBuffer,
	listCampaignDefaultImages,
} from './storyblok-management.integration';

const jsonResponse = (body: unknown, status = 200) => ({
	ok: status >= 200 && status < 300,
	status,
	text: () => Promise.resolve(JSON.stringify(body)),
});

describe('listCampaignDefaultImages', () => {
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

		global.fetch = jest.fn().mockResolvedValue(jsonResponse({ assets })) as typeof fetch;

		const result = await listCampaignDefaultImages();

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toHaveLength(campaignSubmissionConfig.maxCampaignDefaultImages);
			expect(result.data.map((asset) => asset.id)).toEqual([1, 2, 3, 4, 5]);
		}
	});
});

describe('campaignStoryExists', () => {
	const originalFetch = global.fetch;

	afterEach(() => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	test('returns true when a campaign story already uses the slug', async () => {
		process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';
		const slug = 'meine-kampagne';
		const storyPath = getCampaignStoryPath(slug);
		const fetchMock = jest.fn().mockResolvedValue(
			jsonResponse({
				stories: [{ slug, full_slug: storyPath, is_folder: false }],
			}),
		);
		global.fetch = fetchMock as typeof fetch;

		const result = await campaignStoryExists(slug);

		expect(result).toEqual({ success: true, data: true });
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining(`with_slug=${encodeURIComponent(storyPath)}`),
			expect.objectContaining({ method: 'GET' }),
		);
	});

	test('returns false when no matching campaign story exists', async () => {
		process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';
		global.fetch = jest.fn().mockResolvedValue(jsonResponse({ stories: [] })) as typeof fetch;

		await expect(campaignStoryExists('meine-kampagne')).resolves.toEqual({ success: true, data: false });
	});

	test('returns false when the only matching story is a folder', async () => {
		process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';
		const slug = 'meine-kampagne';
		const storyPath = getCampaignStoryPath(slug);
		global.fetch = jest.fn().mockResolvedValue(
			jsonResponse({
				stories: [{ slug, full_slug: storyPath, is_folder: true }],
			}),
		) as typeof fetch;

		await expect(campaignStoryExists(slug)).resolves.toEqual({ success: true, data: false });
	});

	test('returns false when the Storyblok payload has no stories array', async () => {
		process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';
		global.fetch = jest.fn().mockResolvedValue(jsonResponse({})) as typeof fetch;

		await expect(campaignStoryExists('meine-kampagne')).resolves.toEqual({ success: true, data: false });
	});
});

describe('downloadStoryblokAssetBuffer', () => {
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

		const result = await downloadStoryblokAssetBuffer(allowedUrl);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.equals(payload)).toBe(true);
		}
		expect(fetchMock).toHaveBeenCalledWith(
			allowedUrl,
			expect.objectContaining({
				method: 'GET',
				redirect: 'error',
			}),
		);
	});

	test.each([
		'http://a.storyblok.com/f/109655/default.png',
		'https://evil.example.com/f/109655/default.png',
		'https://storyblok.com.evil.com/f/109655/default.png',
		'https://user:pass@a.storyblok.com/f/109655/default.png',
		'not-a-url',
	])('rejects unsafe asset URL %s', async (filename) => {
		const fetchMock = jest.fn();
		global.fetch = fetchMock as typeof fetch;

		await expect(downloadStoryblokAssetBuffer(filename)).resolves.toEqual({
			success: false,
			error: 'Storyblok request failed.',
			status: 400,
		});
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

		await expect(downloadStoryblokAssetBuffer(allowedUrl)).resolves.toEqual({
			success: false,
			error: 'Storyblok request failed.',
			status: 413,
		});
	});

	test('rejects streams that exceed maxImageBytes without Content-Length', async () => {
		const oversized = Buffer.alloc(campaignSubmissionConfig.maxImageBytes + 1, 1);
		const fetchMock = jest.fn().mockResolvedValue(new Response(oversized, { status: 200 }));
		global.fetch = fetchMock as typeof fetch;

		await expect(downloadStoryblokAssetBuffer(allowedUrl)).resolves.toEqual({
			success: false,
			error: 'Storyblok request failed.',
			status: 413,
		});
	});
});
