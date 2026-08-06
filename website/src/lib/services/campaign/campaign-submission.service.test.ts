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
};

describe('CampaignSubmissionService', () => {
	type CampaignCreateInput = {
		data: {
			isActive: boolean;
			public: boolean | null;
			slug: string;
			goal: number | null;
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
		expect(createPublishedCampaignStory).toHaveBeenCalledWith(
			expect.objectContaining({
				slug: 'my-campaign',
				title: 'My Campaign',
				portalSlug: 'my-campaign',
			}),
		);
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
		expect(uploadAsset).not.toHaveBeenCalled();
	});

	test('submit cleans up created resources when Storyblok story creation fails', async () => {
		const { service, db, deleteAsset, createPublishedCampaignStory } = createService();
		createPublishedCampaignStory.mockRejectedValueOnce(new Error('story failed'));

		const result = await service.submit(baseFields, { kind: 'upload', image: pngImage });

		expect(result.success).toBe(false);
		expect(deleteAsset).toHaveBeenCalledWith(10);
		expect(db.campaign.delete).toHaveBeenCalledWith({ where: { id: 'campaign-1' } });
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
