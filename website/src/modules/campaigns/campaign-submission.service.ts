import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import {
	campaignStoryExists,
	createPublishedCampaignStory,
	deleteStoryblokAsset,
	deleteStoryblokStory,
	downloadStoryblokAssetBuffer,
	getStoryblokAsset,
	uploadStoryblokAsset,
} from '@/integrations/storyblok/storyblok-management.integration';
import { verifyTurnstileToken } from '@/integrations/turnstile/turnstile.integration';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { slugify } from '@/lib/utils/string-utils';
import { isProgramEligibleForPublicSubmission } from '@/modules/programs/program-public-submission.service';
import { randomBytes, randomUUID } from 'crypto';
import * as campaignRepository from './campaign.repository';
import { validateCampaignSubmissionImageBuffer, type CampaignSubmissionFields } from './campaign.schemas';
import {
	type CampaignSubmissionImageSource,
	type CampaignSubmissionImageValidation,
	type CampaignSubmissionOptionalImages,
	type CampaignSubmissionResult,
} from './campaign.types';

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

export const submitCampaign = async (
	fields: CampaignSubmissionFields,
	imageSource: CampaignSubmissionImageSource,
	optionalImages: CampaignSubmissionOptionalImages = { profilePicture: null, sectionImage: null },
	contributorId?: string | null,
	turnstileToken?: string | null,
): Promise<ServiceResult<CampaignSubmissionResult>> => {
	const turnstileResult = await verifyTurnstileToken(turnstileToken ?? null);
	if (!turnstileResult.success) {
		return resultFail(turnstileResult.error, turnstileResult.error === 'submission-failed' ? 503 : 400);
	}

	const eligibilityResult = await isProgramEligibleForPublicSubmission(fields.programId);
	if (!eligibilityResult.success) {
		return resultFail('submission-failed', eligibilityResult.status ?? 503);
	}
	if (!eligibilityResult.data) {
		return resultFail('program-not-eligible', 400);
	}

	const slugResult = await generateUniqueSlug(fields.title);
	if (!slugResult.success) {
		return resultFail(slugResult.error, slugResult.status);
	}
	const slug = slugResult.data;
	const cleanupState: SubmissionCleanupState = { assetIds: [] };

	try {
		const imageResult = await resolveImage(imageSource);
		if (!imageResult.success) {
			return imageResult;
		}
		const primaryImage = imageResult.data;

		const campaign = await campaignRepository.createCampaign({
			goal: fields.goal,
			currency: fields.currency,
			endDate: fields.endDate,
			slug,
			programId: fields.programId,
			contributorId,
		});
		if (campaign.kind === 'slug-exists') {
			return resultFail('slug-exists', 400);
		}
		cleanupState.campaignId = campaign.id;

		const [primaryResult, profileResult, sectionResult] = await Promise.all([
			uploadImage(primaryImage, cleanupState),
			uploadOptionalImage(optionalImages.profilePicture, cleanupState),
			fields.hasAdditionalInformation
				? uploadOptionalImage(optionalImages.sectionImage, cleanupState)
				: Promise.resolve(resultOk(undefined)),
		]);

		if (!primaryResult.success) {
			await compensateSubmissionFailure(cleanupState);

			return resultFail('submission-failed', 503);
		}
		if (!profileResult.success) {
			await compensateSubmissionFailure(cleanupState);

			return resultFail('submission-failed', 503);
		}
		if (!sectionResult.success) {
			await compensateSubmissionFailure(cleanupState);

			return resultFail('submission-failed', 503);
		}

		const primaryAsset = primaryResult.data;
		const profilePictureAsset = profileResult.data;
		const sectionImageAsset = sectionResult.data;

		const storyResult = await createPublishedCampaignStory({
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
		if (!storyResult.success) {
			await compensateSubmissionFailure(cleanupState);

			return resultFail('submission-failed', storyResult.status ?? 503);
		}
		cleanupState.storyId = storyResult.data.storyId;

		if (!contributorId) {
			const claimId = await createCampaignPendingRecord(campaign.id);
			if (!claimId) {
				await compensateSubmissionFailure(cleanupState);

				return resultFail('submission-failed', 503);
			}

			return resultOk({ slug, claimId });
		}

		return resultOk({ slug });
	} catch (error) {
		await compensateSubmissionFailure(cleanupState);
		console.error(error, { slug });

		return resultFail('submission-failed', 503);
	}
};

const createCampaignPendingRecord = async (campaignId: string): Promise<string | null> => {
	for (let attempt = 1; attempt <= claimIdCreateMaxAttempts; attempt += 1) {
		const claimId = generateClaimId();
		const created = await campaignRepository.createCampaignPending(campaignId, claimId);
		if (created.kind === 'created') {
			return claimId;
		}
	}

	console.error('Failed to allocate a unique campaign claim id', { campaignId });

	return null;
};

const uploadImage = async (
	image: CampaignSubmissionImageValidation,
	cleanupState: SubmissionCleanupState,
): Promise<ServiceResult<StoryblokAsset>> => {
	const uploaded = await uploadStoryblokAsset(image.buffer, image.filename, image.mimeType, {
		focus: image.focus,
	});
	if (!uploaded.success) {
		return uploaded;
	}
	cleanupState.assetIds.push(uploaded.data.assetId);

	return resultOk(uploaded.data.asset);
};

const uploadOptionalImage = async (
	image: CampaignSubmissionImageValidation | null,
	cleanupState: SubmissionCleanupState,
): Promise<ServiceResult<StoryblokAsset | undefined>> => {
	if (!image) {
		return resultOk(undefined);
	}

	return uploadImage(image, cleanupState);
};

const failDefaultImage = (defaultImageId: number, reason: string, assetFolderId: number | null = null) => {
	console.warn('Campaign submission default image invalid', {
		defaultImageId,
		reason,
		assetFolderId,
	});

	return resultFail('default-image-invalid', 400);
};

const resolveImage = async (
	imageSource: CampaignSubmissionImageSource,
): Promise<ServiceResult<CampaignSubmissionImageValidation>> => {
	if (imageSource.kind === 'upload') {
		return resultOk(imageSource.image);
	}

	try {
		const assetResult = await getStoryblokAsset(imageSource.defaultImageId);
		if (!assetResult.success) {
			return failDefaultImage(imageSource.defaultImageId, 'asset-not-found');
		}
		const asset = assetResult.data;
		if (!asset) {
			return failDefaultImage(imageSource.defaultImageId, 'asset-not-found');
		}

		if (asset.assetFolderId !== campaignSubmissionConfig.storyblokCampaignDefaultImagesFolderId) {
			return failDefaultImage(imageSource.defaultImageId, 'wrong-folder', asset.assetFolderId);
		}

		const bufferResult = await downloadStoryblokAssetBuffer(asset.filename);
		if (!bufferResult.success) {
			return failDefaultImage(imageSource.defaultImageId, 'download-failed', asset.assetFolderId);
		}
		const declaredMimeType = asset.contentType ?? '';
		const validation = validateCampaignSubmissionImageBuffer(
			bufferResult.data,
			declaredMimeType,
			filenameFromUrl(asset.filename),
		);
		if (!validation.success) {
			return failDefaultImage(imageSource.defaultImageId, validation.error, asset.assetFolderId);
		}

		return resultOk({
			...validation.data,
			focus: asset.focus,
		});
	} catch (error) {
		console.error(error, {
			defaultImageId: imageSource.defaultImageId,
			reason: 'unexpected-error',
			assetFolderId: null,
		});

		return resultFail('default-image-invalid', 400);
	}
};

const compensateSubmissionFailure = async (state: SubmissionCleanupState): Promise<void> => {
	if (state.storyId) {
		await deleteStoryblokStory(state.storyId);
	}

	for (const assetId of state.assetIds) {
		await deleteStoryblokAsset(assetId);
	}

	if (state.campaignId) {
		try {
			await campaignRepository.deleteCampaign(state.campaignId);
		} catch (error) {
			console.error(error, { campaignId: state.campaignId });
		}
	}
};

const generateUniqueSlug = async (title: string): Promise<ServiceResult<string>> => {
	const baseSlug = slugify(title);
	if (!baseSlug) {
		return resultFail('title-not-slugifiable', 400);
	}

	try {
		const baseAvailable = await isSlugAvailable(baseSlug);
		if (!baseAvailable.success) {
			return resultFail('submission-failed', baseAvailable.status ?? 503);
		}
		if (baseAvailable.data) {
			return resultOk(baseSlug);
		}

		for (let suffix = 2; suffix <= 20; suffix += 1) {
			const candidate = `${baseSlug}-${suffix}`;
			const candidateAvailable = await isSlugAvailable(candidate);
			if (!candidateAvailable.success) {
				return resultFail('submission-failed', candidateAvailable.status ?? 503);
			}
			if (candidateAvailable.data) {
				return resultOk(candidate);
			}
		}

		return resultOk(`${baseSlug}-${randomUUID()}`);
	} catch (error) {
		console.error(error, { slug: baseSlug });

		return resultFail('submission-failed', 503);
	}
};

const isSlugAvailable = async (slug: string): Promise<ServiceResult<boolean>> => {
	const existing = await campaignRepository.findCampaignIdBySlug(slug);
	if (existing) {
		return resultOk(false);
	}

	const storyExistsResult = await campaignStoryExists(slug);
	if (!storyExistsResult.success) {
		return resultFail(storyExistsResult.error, storyExistsResult.status);
	}

	return resultOk(!storyExistsResult.data);
};
