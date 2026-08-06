import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
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
