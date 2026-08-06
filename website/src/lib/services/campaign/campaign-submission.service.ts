import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { logger } from '@/lib/utils/logger';
import { slugify } from '@/lib/utils/string-utils';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramPublicSubmissionService } from '../program/program-public-submission.service';
import { isStoryblokManagementError, StoryblokManagementService } from '../storyblok/storyblok-management.service';
import {
	validateCampaignSubmissionImageBuffer,
	type CampaignSubmissionFields,
	type CampaignSubmissionImageSource,
	type CampaignSubmissionImageValidation,
} from './campaign-submission-input';
import { CampaignValidationService } from './campaign-validation.service';

export type CampaignSubmissionResult = {
	slug: string;
};

type SubmissionCleanupState = {
	campaignId?: string;
	assetId?: number;
	storyId?: number;
};

const filenameFromUrl = (url: string) => {
	try {
		const pathname = new URL(url).pathname;
		const segment = pathname.split('/').filter(Boolean).at(-1);

		return segment?.trim() ?? 'campaign-image';
	} catch {
		return 'campaign-image';
	}
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
		imageSource: CampaignSubmissionImageSource,
	): Promise<ServiceResult<CampaignSubmissionResult>> {
		const eligibilityResult = await this.programPublicSubmissionService.isProgramEligibleForPublicSubmission(
			fields.programId,
		);
		if (!eligibilityResult.success) {
			return this.resultFail('submission-failed', eligibilityResult.status ?? 503);
		}
		if (!eligibilityResult.data) {
			return this.resultFail('program-not-eligible', 400);
		}

		const titleConflict = await this.db.campaign.findUnique({
			where: { title: fields.title },
			select: { id: true },
		});
		if (titleConflict) {
			return this.resultFail('title-exists', 400);
		}

		const slugResult = await this.generateUniqueSlug(fields.title);
		if (!slugResult.success) {
			return this.resultFail(slugResult.error, slugResult.status);
		}
		const slug = slugResult.data;
		const cleanupState: SubmissionCleanupState = {};

		try {
			const imageResult = await this.resolveImage(imageSource);
			if (!imageResult.success) {
				return imageResult;
			}
			const image = imageResult.data;

			const campaign = await this.db.campaign.create({
				data: {
					title: fields.title,
					description: fields.description,
					goal: fields.goal,
					currency: fields.currency,
					endDate: fields.endDate,
					isActive: true,
					public: fields.public,
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

			const { storyId } = await this.storyblokManagementService.createPublishedCampaignStory({
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

				return this.resultFail('submission-failed', error.retryable ? 503 : 502);
			}

			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				const target = error.meta?.target;
				const conflictFields = Array.isArray(target) ? target.map(String) : typeof target === 'string' ? [target] : [];

				if (conflictFields.includes('slug')) {
					return this.resultFail('similar-title-exists', 400);
				}

				return this.resultFail('title-exists', 400);
			}

			this.logger.error(error, { slug });

			return this.resultFail('submission-failed', 503);
		}
	}

	private async resolveImage(
		imageSource: CampaignSubmissionImageSource,
	): Promise<ServiceResult<CampaignSubmissionImageValidation>> {
		if (imageSource.kind === 'upload') {
			return this.resultOk(imageSource.image);
		}

		try {
			const asset = await this.storyblokManagementService.getAsset(imageSource.defaultImageId);
			if (asset?.assetFolderId !== campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId) {
				return this.resultFail('default-image-invalid', 400);
			}

			const buffer = await this.storyblokManagementService.downloadAssetBuffer(asset.filename);
			const declaredMimeType = asset.contentType ?? '';
			const validation = validateCampaignSubmissionImageBuffer(buffer, declaredMimeType, filenameFromUrl(asset.filename));
			if (!validation.success) {
				return this.resultFail(
					validation.error === 'image-format-unsupported' ? 'default-image-invalid' : validation.error,
					400,
				);
			}

			return this.resultOk(validation.data);
		} catch (error) {
			if (isStoryblokManagementError(error)) {
				this.logger.error(error, {
					defaultImageId: imageSource.defaultImageId,
					retryable: error.retryable,
					statusCode: error.statusCode,
				});

				return this.resultFail(
					error.statusCode === 404 ? 'default-image-invalid' : 'submission-failed',
					error.retryable ? 503 : 400,
				);
			}

			this.logger.error(error, { defaultImageId: imageSource.defaultImageId });

			return this.resultFail('default-image-invalid', 400);
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

	private async generateUniqueSlug(title: string): Promise<ServiceResult<string>> {
		const baseSlug = slugify(title);
		if (!baseSlug) {
			return this.resultFail('title-not-slugifiable', 400);
		}

		const uniquenessResult = await this.campaignValidationService.validateSlugUniqueness(baseSlug);
		if (uniquenessResult.success) {
			return this.resultOk(baseSlug);
		}

		for (let suffix = 2; suffix <= 20; suffix += 1) {
			const candidate = `${baseSlug}-${suffix}`;
			const candidateResult = await this.campaignValidationService.validateSlugUniqueness(candidate);
			if (candidateResult.success) {
				return this.resultOk(candidate);
			}
		}

		return this.resultFail('similar-title-exists', 409);
	}
}
