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

describe('CampaignSubmissionService', () => {
	type CampaignCreateInput = {
		data: {
			isActive: boolean;
			public: boolean;
			slug: string;
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
			isProgramEligible: jest.fn().mockResolvedValue({ success: true, data: true }),
		} as unknown as ProgramPublicSubmissionService;

		const campaignValidationService = {
			validateSlugUniqueness: jest.fn().mockResolvedValue({ success: true, data: undefined }),
		} as unknown as CampaignValidationService;

		const deleteAsset = jest.fn().mockResolvedValue(undefined);
		const createPublishedCampaignStory = jest.fn().mockResolvedValue({ storyId: 20, storyUuid: 'uuid' });

		const storyblokManagementService = {
			uploadAsset: jest.fn().mockResolvedValue({ assetId: 10, asset: { filename: 'image.jpg' } }),
			createPublishedCampaignStory,
			deleteAsset,
			deleteStory: jest.fn().mockResolvedValue(undefined),
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
		};
	};

	test('submit creates public DB campaign and published Storyblok story', async () => {
		const { service, create, createPublishedCampaignStory } = createService();

		const result = await service.submit(
			{
				title: 'My Campaign',
				description: 'Description',
				goal: 500,
				currency: 'CHF',
				endDate: new Date('2030-06-01'),
				programId: 'program-1',
			},
			{
				buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
				mimeType: 'image/png',
				filename: 'cover.png',
				size: 4,
			},
			['program-slug'],
		);

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

	test('submit cleans up created resources when Storyblok story creation fails', async () => {
		const { service, db, deleteAsset, createPublishedCampaignStory } = createService();
		createPublishedCampaignStory.mockRejectedValueOnce(new Error('story failed'));

		const result = await service.submit(
			{
				title: 'My Campaign',
				description: 'Description',
				goal: 500,
				currency: 'CHF',
				endDate: new Date('2030-06-01'),
				programId: 'program-1',
			},
			{
				buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
				mimeType: 'image/png',
				filename: 'cover.png',
				size: 4,
			},
			['program-slug'],
		);

		expect(result.success).toBe(false);
		expect(deleteAsset).toHaveBeenCalledWith(10);
		expect(db.campaign.delete).toHaveBeenCalledWith({ where: { id: 'campaign-1' } });
	});

	test('submit returns a failure result when the title cannot be slugified', async () => {
		const { service, db } = createService();

		const result = await service.submit(
			{
				title: '!!!',
				description: 'Description',
				goal: 500,
				currency: 'CHF',
				endDate: new Date('2030-06-01'),
				programId: 'program-1',
			},
			{
				buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
				mimeType: 'image/png',
				filename: 'cover.png',
				size: 4,
			},
			['program-slug'],
		);

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

		const result = await service.submit(
			{
				title: 'My Campaign',
				description: 'Description',
				goal: 500,
				currency: 'CHF',
				endDate: new Date('2030-06-01'),
				programId: 'program-1',
			},
			{
				buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
				mimeType: 'image/png',
				filename: 'cover.png',
				size: 4,
			},
			['program-slug'],
		);

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

		const result = await service.submit(
			{
				title: 'My Campaign',
				description: 'Description',
				goal: 500,
				currency: 'CHF',
				endDate: new Date('2030-06-01'),
				programId: 'program-1',
			},
			{
				buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
				mimeType: 'image/png',
				filename: 'cover.png',
				size: 4,
			},
			['program-slug'],
		);

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

		const result = await service.submit(
			{
				title: 'My Campaign',
				description: 'Description',
				goal: 500,
				currency: 'CHF',
				endDate: new Date('2030-06-01'),
				programId: 'program-1',
			},
			{
				buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
				mimeType: 'image/png',
				filename: 'cover.png',
				size: 4,
			},
			['program-slug'],
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('similar-title-exists');
			expect(result.status).toBe(400);
		}
	});
});
