import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { slugify } from '@/lib/utils/string-utils';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramPublicSubmissionService } from '../program/program-public-submission.service';
import { isStoryblokManagementError, StoryblokManagementService } from '../storyblok/storyblok-management.service';
import { type CampaignSubmissionFields, type CampaignSubmissionImageValidation } from './campaign-submission-input';
import { CampaignValidationService } from './campaign-validation.service';

export type CampaignSubmissionResult = {
	slug: string;
};

type SubmissionCleanupState = {
	campaignId?: string;
	assetId?: number;
	storyId?: number;
};

export class CampaignSubmissionService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programPublicSubmissionService: ProgramPublicSubmissionService,
		private readonly campaignValidationService: CampaignValidationService,
		private readonly storyblokManagementService: StoryblokManagementService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async submit(
		fields: CampaignSubmissionFields,
		image: CampaignSubmissionImageValidation,
		publishedProgramPortalSlugs: string[],
	): Promise<ServiceResult<CampaignSubmissionResult>> {
		const eligibilityResult = await this.programPublicSubmissionService.isProgramEligible(
			fields.programId,
			publishedProgramPortalSlugs,
		);
		if (!eligibilityResult.success) {
			return this.resultFail(eligibilityResult.error, eligibilityResult.status);
		}
		if (!eligibilityResult.data) {
			return this.resultFail('Selected program is not eligible.', 400);
		}

		const titleConflict = await this.db.campaign.findUnique({
			where: { title: fields.title },
			select: { id: true },
		});
		if (titleConflict) {
			return this.resultFail('A campaign with this title already exists.', 400);
		}

		const slug = await this.generateUniqueSlug(fields.title);
		const cleanupState: SubmissionCleanupState = {};

		try {
			const campaign = await this.db.campaign.create({
				data: {
					title: fields.title,
					description: fields.description,
					goal: fields.goal,
					currency: fields.currency,
					endDate: fields.endDate,
					isActive: false,
					public: false,
					slug,
					program: { connect: { id: fields.programId } },
				},
				select: { id: true, slug: true },
			});
			cleanupState.campaignId = campaign.id;

			const { assetId, asset } = await this.storyblokManagementService.uploadAsset(
				image.buffer,
				image.filename,
				image.mimeType,
			);
			cleanupState.assetId = assetId;

			const { storyId } = await this.storyblokManagementService.createDraftCampaignStory({
				slug,
				title: fields.title,
				description: fields.description,
				portalSlug: slug,
				primaryImage: asset,
			});
			cleanupState.storyId = storyId;

			return this.resultOk({ slug });
		} catch (error) {
			await this.compensateSubmissionFailure(cleanupState);

			if (isStoryblokManagementError(error)) {
				this.logger.error(error, { slug, retryable: error.retryable, statusCode: error.statusCode });

				return this.resultFail(
					'We could not complete your submission. Please try again in a few minutes.',
					error.retryable ? 503 : 502,
				);
			}

			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				return this.resultFail('A campaign with this title already exists.', 400);
			}

			this.logger.error(error, { slug });

			return this.resultFail('We could not complete your submission. Please try again in a few minutes.', 503);
		}
	}

	private async compensateSubmissionFailure(state: SubmissionCleanupState): Promise<void> {
		if (state.storyId) {
			await this.storyblokManagementService.deleteStory(state.storyId);
		}

		if (state.assetId) {
			await this.storyblokManagementService.deleteAsset(state.assetId);
		}

		if (state.campaignId) {
			try {
				await this.db.campaign.delete({ where: { id: state.campaignId } });
			} catch (error) {
				this.logger.error(error, { campaignId: state.campaignId });
			}
		}
	}

	private async generateUniqueSlug(title: string): Promise<string> {
		const baseSlug = slugify(title);
		if (!baseSlug) {
			throw new Error('Could not generate campaign slug.');
		}

		const uniquenessResult = await this.campaignValidationService.validateSlugUniqueness(baseSlug);
		if (uniquenessResult.success) {
			return baseSlug;
		}

		for (let suffix = 2; suffix <= 20; suffix += 1) {
			const candidate = `${baseSlug}-${suffix}`;
			const candidateResult = await this.campaignValidationService.validateSlugUniqueness(candidate);
			if (candidateResult.success) {
				return candidate;
			}
		}

		throw new Error('Could not generate a unique campaign slug.');
	}
}
