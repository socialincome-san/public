import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { ProgramPublicSubmissionService } from '../program/program-public-submission.service';
import { StoryblokManagementError, StoryblokManagementService } from '../storyblok/storyblok-management.service';
import { CampaignSubmissionService } from './campaign-submission.service';
import { CampaignValidationService } from './campaign-validation.service';

jest.mock('@/generated/prisma/client', () => ({
	Prisma: {
		PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
			code: string;
			meta?: { target?: string | string[] };

			constructor(message: string, { code, meta }: { code: string; meta?: { target?: string | string[] } }) {
				super(message);
				this.code = code;
				this.meta = meta;
			}
		},
	},
	PrismaClient: class {},
}));

type PrismaMock = {
	Prisma: {
		PrismaClientKnownRequestError: new (
			message: string,
			options: { code: string; meta?: { target?: string | string[] } },
		) => Error & { code: string; meta?: { target?: string | string[] } };
	};
};

const { Prisma } = jest.requireMock<PrismaMock>('@/generated/prisma/client');

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

describe('CampaignSubmissionService', () => {
	const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

	afterEach(() => {
		consoleWarn.mockClear();
	});

	afterAll(() => {
		consoleWarn.mockRestore();
	});

	type CampaignCreateInput = {
		data: {
			slug: string;
			goal: number | null;
			contributor?: { connect: { id: string } };
		};
	};

	const createService = () => {
		const create = jest.fn().mockResolvedValue({ id: 'campaign-1', slug: 'my-campaign' }) as jest.MockedFunction<
			(input: CampaignCreateInput) => Promise<{ id: string; slug: string }>
		>;
		const createPending = jest.fn().mockImplementation((input: { data: { claimId: string; campaignId: string } }) =>
			Promise.resolve({
				claimId: input.data.claimId,
				campaignId: input.data.campaignId,
			}),
		) as jest.MockedFunction<
			(input: { data: { claimId: string; campaignId: string } }) => Promise<{ claimId: string; campaignId: string }>
		>;
		const db = {
			campaign: {
				create,
				delete: jest.fn().mockResolvedValue(undefined),
			},
			campaignPending: {
				create: createPending,
			},
		};

		const programPublicSubmissionService = {
			isProgramEligibleForPublicSubmission: jest.fn().mockResolvedValue({ success: true, data: true }),
		} as unknown as ProgramPublicSubmissionService;

		const validateSlugUniqueness = jest.fn().mockResolvedValue({ success: true, data: undefined });
		const campaignValidationService = {
			validateSlugUniqueness,
		} as unknown as CampaignValidationService;

		const deleteAsset = jest.fn().mockResolvedValue(undefined);
		const createPublishedCampaignStory = jest.fn().mockResolvedValue({ storyId: 20, storyUuid: 'uuid' });
		const campaignStoryExists = jest.fn().mockResolvedValue(false);
		const getAsset = jest.fn();
		const downloadAssetBuffer = jest.fn();
		const uploadAsset = jest.fn().mockResolvedValue({ assetId: 10, asset: { filename: 'image.jpg' } });

		const storyblokManagementService = {
			uploadAsset,
			createPublishedCampaignStory,
			campaignStoryExists,
			deleteAsset,
			deleteStory: jest.fn().mockResolvedValue(undefined),
			getAsset,
			downloadAssetBuffer,
		} as unknown as StoryblokManagementService;

		const service = new CampaignSubmissionService(
			db as never,
			programPublicSubmissionService,
			campaignValidationService,
			storyblokManagementService,
		);

		return {
			service,
			db,
			create,
			createPending,
			deleteAsset,
			createPublishedCampaignStory,
			campaignStoryExists,
			campaignValidationService,
			validateSlugUniqueness,
			programPublicSubmissionService,
			storyblokManagementService,
			getAsset,
			downloadAssetBuffer,
			uploadAsset,
		};
	};

	test('submit returns program-not-eligible when the program is not eligible', async () => {
		const { service, db, programPublicSubmissionService } = createService();
		(programPublicSubmissionService.isProgramEligibleForPublicSubmission as jest.Mock).mockResolvedValue({
			success: true,
			data: false,
		});

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('program-not-eligible');
			expect(result.status).toBe(400);
		}
		expect(db.campaign.create).not.toHaveBeenCalled();
	});

	test('submit returns submission-failed when eligibility verification fails', async () => {
		const { service, db, programPublicSubmissionService } = createService();
		(programPublicSubmissionService.isProgramEligibleForPublicSubmission as jest.Mock).mockResolvedValue({
			success: false,
			error: 'Failed to fetch programs: {"message":"down"}',
			status: 503,
		});

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('submission-failed');
			expect(result.status).toBe(503);
		}
		expect(db.campaign.create).not.toHaveBeenCalled();
	});

	test('submit creates public DB campaign and published Storyblok story', async () => {
		const { service, create, createPending, createPublishedCampaignStory } = createService();

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.slug).toBe('my-campaign');
			expect(result.data.claimId).toMatch(/^[0-9A-Za-z]{8}$/);
		}
		expect(create).toHaveBeenCalledTimes(1);
		const createArg = create.mock.calls[0]?.[0];
		expect(createArg?.data.slug).toBe('my-campaign');
		expect(createArg?.data.contributor).toBeUndefined();
		expect(createPending).toHaveBeenCalledTimes(1);
		expect(createPending.mock.calls[0]?.[0]).toEqual({
			data: {
				claimId: result.success ? result.data.claimId : undefined,
				campaignId: 'campaign-1',
			},
		});
		expect(createPublishedCampaignStory).toHaveBeenCalledWith(
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
		const { service, create, createPending } = createService();

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage }, undefined, 'contributor-1');

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.claimId).toBeUndefined();
		}
		const createArg = create.mock.calls[0]?.[0];
		expect(createArg?.data.contributor).toEqual({ connect: { id: 'contributor-1' } });
		expect(createPending).not.toHaveBeenCalled();
	});

	test('submit omits contributor connect when contributorId is null', async () => {
		const { service, create, createPending } = createService();

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage }, undefined, null);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.claimId).toMatch(/^[0-9A-Za-z]{8}$/);
		}
		expect(create.mock.calls[0]?.[0]?.data.contributor).toBeUndefined();
		expect(createPending).toHaveBeenCalledTimes(1);
	});

	test('submit retries campaign pending create on claimId collision', async () => {
		const { service, createPending } = createService();
		createPending
			.mockRejectedValueOnce(
				new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
					code: 'P2002',
					meta: { target: ['claim_id'] },
				}),
			)
			.mockImplementationOnce((input: { data: { claimId: string; campaignId: string } }) =>
				Promise.resolve({
					claimId: input.data.claimId,
					campaignId: input.data.campaignId,
				}),
			);

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage }, undefined, null);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.claimId).toMatch(/^[0-9A-Za-z]{8}$/);
		}
		expect(createPending).toHaveBeenCalledTimes(2);
	});

	test('submit uploads optional about images and passes additional Storyblok fields', async () => {
		const { service, createPublishedCampaignStory, uploadAsset } = createService();
		uploadAsset
			.mockResolvedValueOnce({ assetId: 10, asset: { filename: 'primary.png' } })
			.mockResolvedValueOnce({ assetId: 11, asset: { filename: 'profile.png' } })
			.mockResolvedValueOnce({ assetId: 12, asset: { filename: 'section.png' } });

		const profilePicture = { ...pngImage, filename: 'profile.png' };
		const sectionImage = { ...pngImage, filename: 'section.png' };
		const result = await service.submit(
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
		expect(uploadAsset).toHaveBeenCalledTimes(3);
		expect(createPublishedCampaignStory).toHaveBeenCalledWith(
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
		const { service, db, deleteAsset, createPublishedCampaignStory, uploadAsset } = createService();
		uploadAsset
			.mockResolvedValueOnce({ assetId: 10, asset: { filename: 'primary.png' } })
			.mockResolvedValueOnce({ assetId: 11, asset: { filename: 'profile.png' } });
		createPublishedCampaignStory.mockRejectedValueOnce(new Error('story failed'));

		const result = await service.submit(
			baseFields,
			{ kind: 'upload', image: pngImage },
			{
				profilePicture: { ...pngImage, filename: 'profile.png' },
				sectionImage: null,
			},
		);

		expect(result.success).toBe(false);
		expect(deleteAsset).toHaveBeenCalledWith(10);
		expect(deleteAsset).toHaveBeenCalledWith(11);
		expect(db.campaign.delete).toHaveBeenCalledWith({ where: { id: 'campaign-1' } });
	});

	test('submit cleans up successful uploads when a parallel Storyblok upload fails', async () => {
		const { service, db, deleteAsset, uploadAsset } = createService();
		uploadAsset.mockImplementation(async (_buffer: Buffer, filename: string) => {
			if (filename === 'profile.png') {
				await new Promise((resolve) => setTimeout(resolve, 20));
				throw new Error('profile upload failed');
			}

			if (filename === 'section.png') {
				await new Promise((resolve) => setTimeout(resolve, 5));

				return { assetId: 12, asset: { filename: 'section.png' } };
			}

			return { assetId: 10, asset: { filename: 'primary.png' } };
		});

		const result = await service.submit(
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
		expect(deleteAsset).toHaveBeenCalledWith(10);
		expect(deleteAsset).toHaveBeenCalledWith(12);
		expect(db.campaign.delete).toHaveBeenCalledWith({ where: { id: 'campaign-1' } });
	});

	test('submit downloads and re-uploads a default image from the defaults folder', async () => {
		const { service, create, createPublishedCampaignStory, getAsset, downloadAssetBuffer, uploadAsset } = createService();
		getAsset.mockResolvedValue({
			id: 99,
			filename: 'https://a.storyblok.com/f/109655/default.png',
			alt: null,
			focus: null,
			contentType: 'image/png',
			assetFolderId: campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId,
		});
		downloadAssetBuffer.mockResolvedValue(pngImage.buffer);

		const result = await service.submit(
			{ ...baseFields, goal: null, public: false },
			{ kind: 'default', defaultImageId: 99 },
		);

		expect(result.success).toBe(true);
		expect(getAsset).toHaveBeenCalledWith(99);
		expect(downloadAssetBuffer).toHaveBeenCalledWith('https://a.storyblok.com/f/109655/default.png');
		expect(uploadAsset).toHaveBeenCalled();
		const createArg = create.mock.calls[0]?.[0];
		expect(createArg?.data.goal).toBeNull();
		expect(createPublishedCampaignStory).toHaveBeenCalledWith(
			expect.objectContaining({
				public: false,
			}),
		);
	});

	test('submit rejects default images outside the defaults folder', async () => {
		const { service, getAsset, uploadAsset } = createService();
		getAsset.mockResolvedValue({
			id: 99,
			filename: 'https://a.storyblok.com/f/109655/default.png',
			alt: null,
			focus: null,
			contentType: 'image/png',
			assetFolderId: 123,
		});

		const result = await service.submit(baseFields, { kind: 'default', defaultImageId: 99 });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('default-image-invalid');
		}
		expect(consoleWarn).toHaveBeenCalledTimes(1);
		expect(uploadAsset).not.toHaveBeenCalled();
	});

	test('submit rejects a missing default image asset', async () => {
		const { service, getAsset, uploadAsset } = createService();
		getAsset.mockResolvedValue(null);

		const result = await service.submit(baseFields, { kind: 'default', defaultImageId: 99 });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('default-image-invalid');
		}
		expect(consoleWarn).toHaveBeenCalledTimes(1);
		expect(uploadAsset).not.toHaveBeenCalled();
	});

	test('submit rejects a default image with unsupported bytes', async () => {
		const { service, getAsset, downloadAssetBuffer, uploadAsset } = createService();
		getAsset.mockResolvedValue({
			id: 99,
			filename: 'https://a.storyblok.com/f/109655/default.gif',
			alt: null,
			focus: null,
			contentType: 'image/gif',
			assetFolderId: campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId,
		});
		downloadAssetBuffer.mockResolvedValue(Buffer.from('not-an-image'));

		const result = await service.submit(baseFields, { kind: 'default', defaultImageId: 99 });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('default-image-invalid');
		}
		expect(consoleWarn).toHaveBeenCalledTimes(1);
		expect(uploadAsset).not.toHaveBeenCalled();
	});

	test('submit returns a failure result when the title cannot be slugified', async () => {
		const { service, db } = createService();

		const result = await service.submit({ ...baseFields, title: '!!!' }, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('title-not-slugifiable');
			expect(result.status).toBe(400);
		}
		expect(db.campaign.create).not.toHaveBeenCalled();
	});

	test('submit suffixes the slug when it already exists in Storyblok', async () => {
		const { service, create, campaignStoryExists, createPublishedCampaignStory } = createService();
		campaignStoryExists.mockImplementation((slug: string) => slug === 'my-campaign');

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.slug).toBe('my-campaign-2');
		}
		const createArg = create.mock.calls[0]?.[0];
		expect(createArg?.data.slug).toBe('my-campaign-2');
		expect(createPublishedCampaignStory).toHaveBeenCalledWith(
			expect.objectContaining({
				slug: 'my-campaign-2',
				portalSlug: 'my-campaign-2',
			}),
		);
	});

	test('submit skips slugs taken in the database or Storyblok until one is free', async () => {
		const { service, create, validateSlugUniqueness, campaignStoryExists } = createService();
		validateSlugUniqueness.mockImplementation((slug: string) =>
			slug === 'my-campaign' ? { success: false, error: 'taken' } : { success: true, data: undefined },
		);
		campaignStoryExists.mockImplementation((slug: string) => slug === 'my-campaign-2');

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.slug).toBe('my-campaign-3');
		}
		const createArg = create.mock.calls[0]?.[0];
		expect(createArg?.data.slug).toBe('my-campaign-3');
	});

	test('submit returns submission-failed when Storyblok uniqueness lookup fails', async () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		const { service, db, campaignStoryExists } = createService();
		campaignStoryExists.mockRejectedValueOnce(new StoryblokManagementError('Storyblok request failed.', 503, true));

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('submission-failed');
			expect(result.status).toBe(503);
		}
		expect(db.campaign.create).not.toHaveBeenCalled();
		consoleError.mockRestore();
	});

	test('submit returns submission-failed when Storyblok uniqueness lookup throws unexpectedly', async () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		const { service, db, campaignStoryExists } = createService();
		campaignStoryExists.mockRejectedValueOnce(new Error('network down'));

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('submission-failed');
			expect(result.status).toBe(503);
		}
		expect(db.campaign.create).not.toHaveBeenCalled();
		consoleError.mockRestore();
	});

	test('submit appends a uuid when numbered slug suffixes are exhausted', async () => {
		const { service, create, validateSlugUniqueness } = createService();
		validateSlugUniqueness.mockResolvedValue({
			success: false,
			error: 'taken',
		});

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		const uuidSlug = /^my-campaign-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.slug).toMatch(uuidSlug);
		}
		const createArg = create.mock.calls[0]?.[0];
		expect(createArg?.data.slug).toMatch(uuidSlug);
		expect(validateSlugUniqueness).toHaveBeenCalledTimes(20);
	});

	test('submit returns slug-exists when campaign create hits a slug unique constraint', async () => {
		const { service, create } = createService();
		create.mockRejectedValueOnce(
			new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
				code: 'P2002',
				meta: { target: ['slug'] },
			}),
		);

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('slug-exists');
			expect(result.status).toBe(400);
		}
	});
});
