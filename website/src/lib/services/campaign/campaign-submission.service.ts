import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { slugify } from '@/lib/utils/string-utils';
import { randomBytes, randomUUID } from 'crypto';
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
	claimId?: string;
};

const claimIdAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const claimIdLength = 8;
const claimIdCreateMaxAttempts = 5;

const generateClaimId = (): string => {
	const bytes = randomBytes(claimIdLength);

	return Array.from(bytes, (byte) => claimIdAlphabet[byte % claimIdAlphabet.length]).join('');
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
	) {
		super(db);
	}

	async submit(
		fields: CampaignSubmissionFields,
		imageSource: CampaignSubmissionImageSource,
		optionalImages: CampaignSubmissionOptionalImages = { profilePicture: null, sectionImage: null },
		contributorId?: string | null,
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
					goal: fields.goal,
					currency: fields.currency,
					endDate: fields.endDate,
					slug,
					program: { connect: { id: fields.programId } },
					...(contributorId ? { contributor: { connect: { id: contributorId } } } : {}),
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

			if (!contributorId) {
				const claimId = await this.createCampaignPending(campaign.id);

				return this.resultOk({ slug, claimId });
			}

			return this.resultOk({ slug });
		} catch (error) {
			await this.compensateSubmissionFailure(cleanupState);

			if (isStoryblokManagementError(error)) {
				console.error(error, { slug, retryable: error.retryable, statusCode: error.statusCode });

				return this.resultFail('submission-failed', error.retryable ? 503 : 502);
			}

			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				return this.resultFail('slug-exists', 400);
			}

			console.error(error, { slug });

			return this.resultFail('submission-failed', 503);
		}
	}

	private async createCampaignPending(campaignId: string): Promise<string> {
		let lastError: unknown;

		for (let attempt = 1; attempt <= claimIdCreateMaxAttempts; attempt += 1) {
			const claimId = generateClaimId();

			try {
				await this.db.campaignPending.create({
					data: {
						claimId,
						campaignId,
					},
				});

				return claimId;
			} catch (error) {
				lastError = error;
				const isClaimIdCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

				if (isClaimIdCollision && attempt < claimIdCreateMaxAttempts) {
					continue;
				}

				if (isClaimIdCollision) {
					break;
				}

				throw error;
			}
		}

		console.error(lastError, { campaignId, reason: 'claim-id-allocation-failed' });
		throw new Error('Failed to allocate a unique campaign claim id');
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
		console.warn('Campaign submission default image invalid', {
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
				console.error(error, {
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

			console.error(error, {
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
				console.error(error, { campaignId: state.campaignId });
			}
		}
	}

	private async generateUniqueSlug(title: string): Promise<ServiceResult<string>> {
		const baseSlug = slugify(title);
		if (!baseSlug) {
			return this.resultFail('title-not-slugifiable', 400);
		}

		try {
			if (await this.isSlugAvailable(baseSlug)) {
				return this.resultOk(baseSlug);
			}

			for (let suffix = 2; suffix <= 20; suffix += 1) {
				const candidate = `${baseSlug}-${suffix}`;
				if (await this.isSlugAvailable(candidate)) {
					return this.resultOk(candidate);
				}
			}

			return this.resultOk(`${baseSlug}-${randomUUID()}`);
		} catch (error) {
			if (isStoryblokManagementError(error)) {
				console.error(error, { slug: baseSlug, retryable: error.retryable, statusCode: error.statusCode });

				return this.resultFail('submission-failed', error.retryable ? 503 : 502);
			}

			console.error(error, { slug: baseSlug });

			return this.resultFail('submission-failed', 503);
		}
	}

	private async isSlugAvailable(slug: string): Promise<boolean> {
		const uniquenessResult = await this.campaignValidationService.validateSlugUniqueness(slug);
		if (!uniquenessResult.success) {
			return false;
		}

		return !(await this.storyblokManagementService.campaignStoryExists(slug));
	}
}
