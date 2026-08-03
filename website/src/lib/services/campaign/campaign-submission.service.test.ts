import { ProgramPublicSubmissionService } from '../program/program-public-submission.service';
import { StoryblokManagementService } from '../storyblok/storyblok-management.service';
import { CampaignSubmissionService } from './campaign-submission.service';
import { CampaignValidationService } from './campaign-validation.service';

jest.mock('@/generated/prisma/client', () => ({
	Prisma: {
		PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
			code = 'P2002';
		},
	},
	PrismaClient: class {},
}));

describe('CampaignSubmissionService', () => {
	const createService = () => {
		const db = {
			campaign: {
				findUnique: jest.fn().mockResolvedValue(null),
				create: jest.fn().mockResolvedValue({ id: 'campaign-1', slug: 'my-campaign' }),
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
		const createDraftCampaignStory = jest.fn().mockResolvedValue({ storyId: 20, storyUuid: 'uuid' });

		const storyblokManagementService = {
			uploadAsset: jest.fn().mockResolvedValue({ assetId: 10, asset: { filename: 'image.jpg' } }),
			createDraftCampaignStory,
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
			deleteAsset,
			createDraftCampaignStory,
			campaignValidationService,
		};
	};

	test('submit creates DB campaign and draft Storyblok story', async () => {
		const { service } = createService();

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
	});

	test('submit cleans up created resources when Storyblok story creation fails', async () => {
		const { service, db, deleteAsset, createDraftCampaignStory } = createService();
		createDraftCampaignStory.mockRejectedValueOnce(new Error('story failed'));

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
			expect(result.error).toBe('Title must contain letters or numbers.');
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
			expect(result.error).toMatch(/similar title/);
		}
		expect(db.campaign.create).not.toHaveBeenCalled();
	});
});
