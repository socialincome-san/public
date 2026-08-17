import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { ProgramPublicSubmissionService } from '../program/program-public-submission.service';
import { StoryblokManagementService } from '../storyblok/storyblok-management.service';
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
	type CampaignCreateInput = {
		data: {
			isActive: boolean;
			public: boolean | null;
			slug: string;
			goal: number | null;
			creatorName: string | null;
		};
	};

	const createService = () => {
		const create = jest.fn().mockResolvedValue({ id: 'campaign-1', slug: 'my-campaign' }) as jest.MockedFunction<
			(input: CampaignCreateInput) => Promise<{ id: string; slug: string }>
		>;
		const db = {
			campaign: {
				findUnique: jest.fn().mockResolvedValue(null),
				create,
				delete: jest.fn().mockResolvedValue(undefined),
			},
		};

		const programPublicSubmissionService = {
			isProgramEligibleForPublicSubmission: jest.fn().mockResolvedValue({ success: true, data: true }),
		} as unknown as ProgramPublicSubmissionService;

		const campaignValidationService = {
			validateSlugUniqueness: jest.fn().mockResolvedValue({ success: true, data: undefined }),
		} as unknown as CampaignValidationService;

		const deleteAsset = jest.fn().mockResolvedValue(undefined);
		const createPublishedCampaignStory = jest.fn().mockResolvedValue({ storyId: 20, storyUuid: 'uuid' });
		const getAsset = jest.fn();
		const downloadAssetBuffer = jest.fn();
		const uploadAsset = jest.fn().mockResolvedValue({ assetId: 10, asset: { filename: 'image.jpg' } });
		const loggerInstance = {
			warn: jest.fn(),
			error: jest.fn(),
			info: jest.fn(),
			debug: jest.fn(),
			alert: jest.fn(),
		};

		const storyblokManagementService = {
			uploadAsset,
			createPublishedCampaignStory,
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
			loggerInstance,
		);

		return {
			service,
			db,
			create,
			deleteAsset,
			createPublishedCampaignStory,
			campaignValidationService,
			programPublicSubmissionService,
			storyblokManagementService,
			getAsset,
			downloadAssetBuffer,
			uploadAsset,
			loggerInstance,
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
		const { service, create, createPublishedCampaignStory } = createService();

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.slug).toBe('my-campaign');
		}
		expect(create).toHaveBeenCalledTimes(1);
		const createArg = create.mock.calls[0]?.[0];
		expect(createArg?.data.isActive).toBe(true);
		expect(createArg?.data.public).toBe(true);
		expect(createArg?.data.slug).toBe('my-campaign');
		expect(createArg?.data.creatorName).toBe('Alex Creator');
		expect(createPublishedCampaignStory).toHaveBeenCalledWith(
			expect.objectContaining({
				slug: 'my-campaign',
				title: 'My Campaign',
				portalSlug: 'my-campaign',
				creatorName: 'Alex Creator',
				quote: 'Thank you for your support!',
			}),
		);
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
		const { service, create, getAsset, downloadAssetBuffer, uploadAsset } = createService();
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
		expect(createArg?.data.public).toBe(false);
		expect(createArg?.data.goal).toBeNull();
	});

	test('submit rejects default images outside the defaults folder', async () => {
		const { service, getAsset, uploadAsset, loggerInstance } = createService();
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
		expect(loggerInstance.warn).toHaveBeenCalledTimes(1);
		expect(uploadAsset).not.toHaveBeenCalled();
	});

	test('submit rejects a missing default image asset', async () => {
		const { service, getAsset, uploadAsset, loggerInstance } = createService();
		getAsset.mockResolvedValue(null);

		const result = await service.submit(baseFields, { kind: 'default', defaultImageId: 99 });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('default-image-invalid');
		}
		expect(loggerInstance.warn).toHaveBeenCalledTimes(1);
		expect(uploadAsset).not.toHaveBeenCalled();
	});

	test('submit rejects a default image with unsupported bytes', async () => {
		const { service, getAsset, downloadAssetBuffer, uploadAsset, loggerInstance } = createService();
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
		expect(loggerInstance.warn).toHaveBeenCalledTimes(1);
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

	test('submit returns a failure result when no unique slug can be found', async () => {
		const { service, db, campaignValidationService } = createService();
		(campaignValidationService.validateSlugUniqueness as jest.Mock).mockResolvedValue({
			success: false,
			error: 'taken',
		});

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.status).toBe(409);
			expect(result.error).toBe('similar-title-exists');
		}
		expect(db.campaign.create).not.toHaveBeenCalled();
	});

	test('submit returns title-exists when campaign create hits a title unique constraint', async () => {
		const { service, create } = createService();
		create.mockRejectedValueOnce(
			new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
				code: 'P2002',
				meta: { target: ['title'] },
			}),
		);

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('title-exists');
			expect(result.status).toBe(400);
		}
	});

	test('submit returns similar-title-exists when campaign create hits a slug unique constraint', async () => {
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
			expect(result.error).toBe('similar-title-exists');
			expect(result.status).toBe(400);
		}
	});
});
