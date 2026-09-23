import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';

const mockVerifyTurnstileToken = jest.fn();
const mockIsProgramEligibleForPublicSubmission = jest.fn();
const mockFindCampaignIdBySlug = jest.fn();
type CreateCampaignInput = {
	goal: number | null;
	currency: string;
	endDate: Date;
	slug: string;
	programId: string;
	contributorId?: string | null;
};
type CreateCampaignResult = { kind: 'created'; id: string; slug: string } | { kind: 'slug-exists' };
const mockCreateCampaign = jest.fn<Promise<CreateCampaignResult>, [CreateCampaignInput]>();
const mockCreateCampaignPending = jest.fn();
const mockDeleteCampaign = jest.fn();
const mockCampaignStoryExists = jest.fn();
const mockUploadStoryblokAsset = jest.fn();
const mockCreatePublishedCampaignStory = jest.fn();
const mockGetStoryblokAsset = jest.fn();
const mockDownloadStoryblokAssetBuffer = jest.fn();
const mockDeleteStoryblokAsset = jest.fn();
const mockDeleteStoryblokStory = jest.fn();

jest.mock('@/integrations/turnstile/turnstile.integration', () => ({
	verifyTurnstileToken: mockVerifyTurnstileToken,
}));

jest.mock('@/modules/programs/program-public-submission.service', () => ({
	isProgramEligibleForPublicSubmission: mockIsProgramEligibleForPublicSubmission,
}));

jest.mock('./campaign.repository', () => ({
	findCampaignIdBySlug: mockFindCampaignIdBySlug,
	createCampaign: mockCreateCampaign,
	createCampaignPending: mockCreateCampaignPending,
	deleteCampaign: mockDeleteCampaign,
}));

jest.mock('@/integrations/storyblok/storyblok-management.integration', () => ({
	campaignStoryExists: mockCampaignStoryExists,
	uploadStoryblokAsset: mockUploadStoryblokAsset,
	createPublishedCampaignStory: mockCreatePublishedCampaignStory,
	getStoryblokAsset: mockGetStoryblokAsset,
	downloadStoryblokAssetBuffer: mockDownloadStoryblokAssetBuffer,
	deleteStoryblokAsset: mockDeleteStoryblokAsset,
	deleteStoryblokStory: mockDeleteStoryblokStory,
}));

import { submitCampaign } from './campaign-submission.service';

const pngImage = {
	buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
	mimeType: 'image/png' as const,
	filename: 'cover.png',
	size: 9,
};

const baseFields = {
	title: 'My Campaign',
	description: 'Description',
	goal: 500 as number | null,
	currency: 'CHF' as const,
	endDate: new Date('2030-06-01'),
	programId: 'program-1',
	public: true,
	creatorName: 'Alex Creator',
	quote: 'Thank you for your support!',
	hasAdditionalInformation: false,
	sectionDescription: null as string | null,
	instagramHandle: null as string | null,
	xHandle: null as string | null,
	linkWebsite: null as string | null,
	tiktokHandle: null as string | null,
};

const submit = (
	fields = baseFields,
	imageSource: Parameters<typeof submitCampaign>[1] = { kind: 'upload', image: pngImage },
	optionalImages?: Parameters<typeof submitCampaign>[2],
	contributorId?: string | null,
) => submitCampaign(fields, imageSource, optionalImages, contributorId, 'turnstile-token');

describe('submitCampaign', () => {
	const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

	beforeEach(() => {
		jest.clearAllMocks();
		mockVerifyTurnstileToken.mockResolvedValue({ success: true, data: undefined });
		mockIsProgramEligibleForPublicSubmission.mockResolvedValue({ success: true, data: true });
		mockFindCampaignIdBySlug.mockResolvedValue(null);
		mockCampaignStoryExists.mockResolvedValue({ success: true, data: false });
		mockCreateCampaign.mockResolvedValue({ kind: 'created', id: 'campaign-1', slug: 'my-campaign' });
		mockCreateCampaignPending.mockResolvedValue({ kind: 'created' });
		mockDeleteCampaign.mockResolvedValue(undefined);
		mockUploadStoryblokAsset.mockResolvedValue({
			success: true,
			data: { assetId: 10, asset: { filename: 'image.jpg' } },
		});
		mockCreatePublishedCampaignStory.mockResolvedValue({
			success: true,
			data: { storyId: 20, storyUuid: 'uuid' },
		});
		mockDeleteStoryblokAsset.mockResolvedValue({ success: true, data: undefined });
		mockDeleteStoryblokStory.mockResolvedValue({ success: true, data: undefined });
	});

	afterEach(() => {
		consoleWarn.mockClear();
	});

	afterAll(() => {
		consoleWarn.mockRestore();
	});

	test('returns program-not-eligible when the program is not eligible', async () => {
		mockIsProgramEligibleForPublicSubmission.mockResolvedValue({ success: true, data: false });

		const result = await submit();

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('program-not-eligible');
			expect(result.status).toBe(400);
		}
		expect(mockCreateCampaign).not.toHaveBeenCalled();
	});

	test('returns submission-failed when eligibility verification fails', async () => {
		mockIsProgramEligibleForPublicSubmission.mockResolvedValue({
			success: false,
			error: 'Failed to fetch programs',
			status: 503,
		});

		const result = await submit();

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('submission-failed');
			expect(result.status).toBe(503);
		}
		expect(mockCreateCampaign).not.toHaveBeenCalled();
	});

	test('returns turnstile failures before creating a campaign', async () => {
		mockVerifyTurnstileToken.mockResolvedValue({ success: false, error: 'turnstile-required' });

		const result = await submit();

		expect(result).toEqual({ success: false, error: 'turnstile-required', status: 400 });
		expect(mockIsProgramEligibleForPublicSubmission).not.toHaveBeenCalled();
		expect(mockCreateCampaign).not.toHaveBeenCalled();
	});

	test('submit creates public DB campaign and published Storyblok story', async () => {
		const result = await submit();

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.slug).toBe('my-campaign');
			expect(result.data.claimId).toMatch(/^[0-9A-Za-z]{8}$/);
		}
		expect(mockCreateCampaign).toHaveBeenCalledTimes(1);
		expect(mockCreateCampaign).toHaveBeenCalledWith(
			expect.objectContaining({
				slug: 'my-campaign',
				programId: 'program-1',
				contributorId: undefined,
			}),
		);
		expect(mockCreateCampaignPending).toHaveBeenCalledTimes(1);
		expect(mockCreateCampaignPending).toHaveBeenCalledWith('campaign-1', result.success ? result.data.claimId : undefined);
		expect(mockCreatePublishedCampaignStory).toHaveBeenCalledWith(
			expect.objectContaining({
				slug: 'my-campaign',
				title: 'My Campaign',
				portalSlug: 'my-campaign',
				public: true,
				creatorName: 'Alex Creator',
				quote: 'Thank you for your support!',
			}),
		);
	});

	test('submit connects contributor when contributorId is provided', async () => {
		const result = await submit(baseFields, { kind: 'upload', image: pngImage }, undefined, 'contributor-1');

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.claimId).toBeUndefined();
		}
		expect(mockCreateCampaign).toHaveBeenCalledWith(expect.objectContaining({ contributorId: 'contributor-1' }));
		expect(mockCreateCampaignPending).not.toHaveBeenCalled();
	});

	test('submit omits contributor connect when contributorId is null', async () => {
		const result = await submit(baseFields, { kind: 'upload', image: pngImage }, undefined, null);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.claimId).toMatch(/^[0-9A-Za-z]{8}$/);
		}
		expect(mockCreateCampaign).toHaveBeenCalledWith(expect.objectContaining({ contributorId: null }));
		expect(mockCreateCampaignPending).toHaveBeenCalledTimes(1);
	});

	test('submit passes uploaded image focus to Storyblok', async () => {
		await submit(baseFields, { kind: 'upload', image: { ...pngImage, focus: '400x250:400x250' } }, undefined, null);

		expect(mockUploadStoryblokAsset).toHaveBeenCalledWith(
			pngImage.buffer,
			pngImage.filename,
			pngImage.mimeType,
			expect.objectContaining({ focus: '400x250:400x250' }),
		);
	});

	test('submit retries campaign pending create on claimId collision', async () => {
		mockCreateCampaignPending.mockResolvedValueOnce({ kind: 'claim-id-exists' }).mockResolvedValueOnce({ kind: 'created' });

		const result = await submit(baseFields, { kind: 'upload', image: pngImage }, undefined, null);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.claimId).toMatch(/^[0-9A-Za-z]{8}$/);
		}
		expect(mockCreateCampaignPending).toHaveBeenCalledTimes(2);
	});

	test('submit uploads optional about images and passes additional Storyblok fields', async () => {
		mockUploadStoryblokAsset
			.mockResolvedValueOnce({ success: true, data: { assetId: 10, asset: { filename: 'primary.png' } } })
			.mockResolvedValueOnce({ success: true, data: { assetId: 11, asset: { filename: 'profile.png' } } })
			.mockResolvedValueOnce({ success: true, data: { assetId: 12, asset: { filename: 'section.png' } } });

		const profilePicture = { ...pngImage, filename: 'profile.png' };
		const sectionImage = { ...pngImage, filename: 'section.png' };
		const result = await submit(
			{
				...baseFields,
				hasAdditionalInformation: true,
				sectionDescription: 'Extra section',
				instagramHandle: 'example',
				xHandle: 'example',
				linkWebsite: 'https://example.com',
				tiktokHandle: 'example',
			},
			{ kind: 'upload', image: pngImage },
			{ profilePicture, sectionImage },
		);

		expect(result.success).toBe(true);
		expect(mockUploadStoryblokAsset).toHaveBeenCalledTimes(3);
		expect(mockCreatePublishedCampaignStory).toHaveBeenCalledWith(
			expect.objectContaining({
				creatorName: 'Alex Creator',
				quote: 'Thank you for your support!',
				sectionDescription: 'Extra section',
				instagramHandle: 'example',
				xHandle: 'example',
				linkWebsite: 'https://example.com',
				tiktokHandle: 'example',
				profilePicture: { filename: 'profile.png' },
				sectionImage: { filename: 'section.png' },
			}),
		);
	});

	test('submit cleans up all uploaded assets when Storyblok story creation fails', async () => {
		mockUploadStoryblokAsset
			.mockResolvedValueOnce({ success: true, data: { assetId: 10, asset: { filename: 'primary.png' } } })
			.mockResolvedValueOnce({ success: true, data: { assetId: 11, asset: { filename: 'profile.png' } } });
		mockCreatePublishedCampaignStory.mockResolvedValueOnce({
			success: false,
			error: 'story failed',
			status: 503,
		});

		const result = await submit(
			baseFields,
			{ kind: 'upload', image: pngImage },
			{
				profilePicture: { ...pngImage, filename: 'profile.png' },
				sectionImage: null,
			},
		);

		expect(result.success).toBe(false);
		expect(mockDeleteStoryblokAsset).toHaveBeenCalledWith(10);
		expect(mockDeleteStoryblokAsset).toHaveBeenCalledWith(11);
		expect(mockDeleteCampaign).toHaveBeenCalledWith('campaign-1');
	});

	test('submit cleans up successful uploads when a parallel Storyblok upload fails', async () => {
		mockUploadStoryblokAsset.mockImplementation(async (_buffer: Buffer, filename: string) => {
			if (filename === 'profile.png') {
				await new Promise((resolve) => setTimeout(resolve, 20));

				return { success: false, error: 'profile upload failed', status: 503 };
			}

			if (filename === 'section.png') {
				await new Promise((resolve) => setTimeout(resolve, 5));

				return { success: true, data: { assetId: 12, asset: { filename: 'section.png' } } };
			}

			return { success: true, data: { assetId: 10, asset: { filename: 'primary.png' } } };
		});

		const result = await submit(
			{
				...baseFields,
				hasAdditionalInformation: true,
				sectionDescription: 'Extra section',
			},
			{ kind: 'upload', image: pngImage },
			{
				profilePicture: { ...pngImage, filename: 'profile.png' },
				sectionImage: { ...pngImage, filename: 'section.png' },
			},
		);

		expect(result.success).toBe(false);
		expect(mockDeleteStoryblokAsset).toHaveBeenCalledWith(10);
		expect(mockDeleteStoryblokAsset).toHaveBeenCalledWith(12);
		expect(mockDeleteCampaign).toHaveBeenCalledWith('campaign-1');
	});

	test('submit downloads and re-uploads a default image from the defaults folder', async () => {
		mockGetStoryblokAsset.mockResolvedValue({
			success: true,
			data: {
				id: 99,
				filename: 'https://a.storyblok.com/f/109655/default.png',
				alt: null,
				focus: '100x120:100x120',
				contentType: 'image/png',
				assetFolderId: campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId,
			},
		});
		mockDownloadStoryblokAssetBuffer.mockResolvedValue({ success: true, data: pngImage.buffer });

		const result = await submit({ ...baseFields, goal: null, public: false }, { kind: 'default', defaultImageId: 99 });

		expect(result.success).toBe(true);
		expect(mockGetStoryblokAsset).toHaveBeenCalledWith(99);
		expect(mockDownloadStoryblokAssetBuffer).toHaveBeenCalledWith('https://a.storyblok.com/f/109655/default.png');
		expect(mockUploadStoryblokAsset).toHaveBeenCalledWith(
			pngImage.buffer,
			expect.any(String),
			'image/png',
			expect.objectContaining({ focus: '100x120:100x120' }),
		);
		expect(mockCreateCampaign).toHaveBeenCalledWith(expect.objectContaining({ goal: null }));
		expect(mockCreatePublishedCampaignStory).toHaveBeenCalledWith(expect.objectContaining({ public: false }));
	});

	test('submit rejects default images outside the defaults folder', async () => {
		mockGetStoryblokAsset.mockResolvedValue({
			success: true,
			data: {
				id: 99,
				filename: 'https://a.storyblok.com/f/109655/default.png',
				alt: null,
				focus: null,
				contentType: 'image/png',
				assetFolderId: 123,
			},
		});

		const result = await submit(baseFields, { kind: 'default', defaultImageId: 99 });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('default-image-invalid');
		}
		expect(consoleWarn).toHaveBeenCalledTimes(1);
		expect(mockUploadStoryblokAsset).not.toHaveBeenCalled();
	});

	test('submit rejects a missing default image asset', async () => {
		mockGetStoryblokAsset.mockResolvedValue({ success: true, data: null });

		const result = await submit(baseFields, { kind: 'default', defaultImageId: 99 });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('default-image-invalid');
		}
		expect(consoleWarn).toHaveBeenCalledTimes(1);
		expect(mockUploadStoryblokAsset).not.toHaveBeenCalled();
	});

	test('submit rejects a default image with unsupported bytes', async () => {
		mockGetStoryblokAsset.mockResolvedValue({
			success: true,
			data: {
				id: 99,
				filename: 'https://a.storyblok.com/f/109655/default.gif',
				alt: null,
				focus: null,
				contentType: 'image/gif',
				assetFolderId: campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId,
			},
		});
		mockDownloadStoryblokAssetBuffer.mockResolvedValue({ success: true, data: Buffer.from('not-an-image') });

		const result = await submit(baseFields, { kind: 'default', defaultImageId: 99 });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('default-image-invalid');
		}
		expect(consoleWarn).toHaveBeenCalledTimes(1);
		expect(mockUploadStoryblokAsset).not.toHaveBeenCalled();
	});

	test('submit returns a failure result when the title cannot be slugified', async () => {
		const result = await submit({ ...baseFields, title: '!!!' });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('title-not-slugifiable');
			expect(result.status).toBe(400);
		}
		expect(mockCreateCampaign).not.toHaveBeenCalled();
	});

	test('submit suffixes the slug when it already exists in Storyblok', async () => {
		mockCampaignStoryExists.mockImplementation((slug: string) =>
			Promise.resolve({ success: true, data: slug === 'my-campaign' }),
		);

		const result = await submit();

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.slug).toBe('my-campaign-2');
		}
		expect(mockCreateCampaign).toHaveBeenCalledWith(expect.objectContaining({ slug: 'my-campaign-2' }));
		expect(mockCreatePublishedCampaignStory).toHaveBeenCalledWith(
			expect.objectContaining({
				slug: 'my-campaign-2',
				portalSlug: 'my-campaign-2',
			}),
		);
	});

	test('submit skips slugs taken in the database or Storyblok until one is free', async () => {
		mockFindCampaignIdBySlug.mockImplementation((slug: string) =>
			Promise.resolve(slug === 'my-campaign' ? { id: 'existing' } : null),
		);
		mockCampaignStoryExists.mockImplementation((slug: string) =>
			Promise.resolve({ success: true, data: slug === 'my-campaign-2' }),
		);

		const result = await submit();

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.slug).toBe('my-campaign-3');
		}
		expect(mockCreateCampaign).toHaveBeenCalledWith(expect.objectContaining({ slug: 'my-campaign-3' }));
	});

	test('submit returns submission-failed when Storyblok uniqueness lookup fails', async () => {
		mockCampaignStoryExists.mockResolvedValueOnce({
			success: false,
			error: 'Storyblok request failed.',
			status: 503,
		});

		const result = await submit();

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('submission-failed');
			expect(result.status).toBe(503);
		}
		expect(mockCreateCampaign).not.toHaveBeenCalled();
	});

	test('submit appends a uuid when numbered slug suffixes are exhausted', async () => {
		mockFindCampaignIdBySlug.mockResolvedValue({ id: 'existing' });

		const result = await submit();

		const uuidSlug = /^my-campaign-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.slug).toMatch(uuidSlug);
		}
		expect(mockCreateCampaign.mock.calls[0]?.[0].slug).toMatch(uuidSlug);
		expect(mockFindCampaignIdBySlug).toHaveBeenCalledTimes(20);
	});

	test('submit returns slug-exists when campaign create hits a slug unique constraint', async () => {
		mockCreateCampaign.mockResolvedValueOnce({ kind: 'slug-exists' });

		const result = await submit();

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('slug-exists');
			expect(result.status).toBe(400);
		}
	});
});
