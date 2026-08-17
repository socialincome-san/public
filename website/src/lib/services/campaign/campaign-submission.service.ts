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
	type CampaignSubmissionOptionalImages,
} from './campaign-submission-input';
import { CampaignValidationService } from './campaign-validation.service';

export type CampaignSubmissionResult = {
	slug: string;
};

type SubmissionCleanupState = {
	campaignId?: string;
	assetIds: number[];
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
		optionalImages: CampaignSubmissionOptionalImages = { profilePicture: null, sectionImage: null },
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
		const cleanupState: SubmissionCleanupState = { assetIds: [] };

		try {
			const imageResult = await this.resolveImage(imageSource);
			if (!imageResult.success) {
				return imageResult;
			}
			const primaryImage = imageResult.data;

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
					creatorName: fields.creatorName,
					program: { connect: { id: fields.programId } },
				},
				select: { id: true, slug: true },
			});
			cleanupState.campaignId = campaign.id;

			// Wait for all uploads to settle so successful assetIds are recorded before any cleanup.
			const [primaryResult, profileResult, sectionResult] = await Promise.allSettled([
				this.uploadImage(primaryImage, cleanupState),
				this.uploadOptionalImage(optionalImages.profilePicture, cleanupState),
				fields.hasAdditionalInformation
					? this.uploadOptionalImage(optionalImages.sectionImage, cleanupState)
					: Promise.resolve(undefined),
			]);

			if (primaryResult.status === 'rejected') {
				throw primaryResult.reason;
			}
			if (profileResult.status === 'rejected') {
				throw profileResult.reason;
			}
			if (sectionResult.status === 'rejected') {
				throw sectionResult.reason;
			}

			const primaryAsset = primaryResult.value;
			const profilePictureAsset = profileResult.value;
			const sectionImageAsset = sectionResult.value;

			const { storyId } = await this.storyblokManagementService.createPublishedCampaignStory({
				slug,
				title: fields.title,
				description: fields.description,
				portalSlug: slug,
				public: fields.public,
				primaryImage: primaryAsset,
				creatorName: fields.creatorName,
				quote: fields.quote,
				...(profilePictureAsset ? { profilePicture: profilePictureAsset } : {}),
				...(fields.hasAdditionalInformation
					? {
							sectionDescription: fields.sectionDescription,
							...(sectionImageAsset ? { sectionImage: sectionImageAsset } : {}),
							instagramHandle: fields.instagramHandle,
							xHandle: fields.xHandle,
							linkWebsite: fields.linkWebsite,
							tiktokHandle: fields.tiktokHandle,
						}
					: {}),
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

	private async uploadImage(image: CampaignSubmissionImageValidation, cleanupState: SubmissionCleanupState) {
		const uploaded = await this.storyblokManagementService.uploadAsset(image.buffer, image.filename, image.mimeType);
		cleanupState.assetIds.push(uploaded.assetId);

		return uploaded.asset;
	}

	private async uploadOptionalImage(image: CampaignSubmissionImageValidation | null, cleanupState: SubmissionCleanupState) {
		if (!image) {
			return undefined;
		}

		return this.uploadImage(image, cleanupState);
	}

	private failDefaultImage(defaultImageId: number, reason: string, assetFolderId: number | null = null) {
		this.logger.warn('Campaign submission default image invalid', {
			defaultImageId,
			reason,
			assetFolderId,
		});

		return this.resultFail('default-image-invalid', 400);
	}

	private async resolveImage(
		imageSource: CampaignSubmissionImageSource,
	): Promise<ServiceResult<CampaignSubmissionImageValidation>> {
		if (imageSource.kind === 'upload') {
			return this.resultOk(imageSource.image);
		}

		try {
			const asset = await this.storyblokManagementService.getAsset(imageSource.defaultImageId);
			if (!asset) {
				return this.failDefaultImage(imageSource.defaultImageId, 'asset-not-found');
			}

			if (asset.assetFolderId !== campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId) {
				return this.failDefaultImage(imageSource.defaultImageId, 'wrong-folder', asset.assetFolderId);
			}

			const buffer = await this.storyblokManagementService.downloadAssetBuffer(asset.filename);
			const declaredMimeType = asset.contentType ?? '';
			const validation = validateCampaignSubmissionImageBuffer(buffer, declaredMimeType, filenameFromUrl(asset.filename));
			if (!validation.success) {
				return this.failDefaultImage(imageSource.defaultImageId, validation.error, asset.assetFolderId);
			}

			return this.resultOk(validation.data);
		} catch (error) {
			if (isStoryblokManagementError(error)) {
				this.logger.error(error, {
					defaultImageId: imageSource.defaultImageId,
					reason: error.statusCode === 404 ? 'asset-not-found' : 'storyblok-management-error',
					assetFolderId: null,
					retryable: error.retryable,
					statusCode: error.statusCode,
				});

				return this.resultFail(
					error.statusCode === 404 ? 'default-image-invalid' : 'submission-failed',
					error.retryable ? 503 : 400,
				);
			}

			this.logger.error(error, {
				defaultImageId: imageSource.defaultImageId,
				reason: 'unexpected-error',
				assetFolderId: null,
			});

			return this.resultFail('default-image-invalid', 400);
		}
	}

	private async compensateSubmissionFailure(state: SubmissionCleanupState): Promise<void> {
		if (state.storyId) {
			await this.storyblokManagementService.deleteStory(state.storyId);
		}

		for (const assetId of state.assetIds) {
			await this.storyblokManagementService.deleteAsset(assetId);
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
