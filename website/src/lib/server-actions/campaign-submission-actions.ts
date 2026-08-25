'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { getOptionalContributor } from '@/lib/firebase/current-contributor';
import type { ClaimPendingCampaignsResult } from '@/lib/services/campaign/campaign-pending-claim.service';
import {
	createCampaignSubmissionPersonalSchema,
	isCampaignSubmissionErrorCode,
	isCampaignSubmissionImageErrorCode,
	parseCampaignSubmissionDefaultImageId,
	parseCampaignSubmissionFields,
	parseCampaignSubmissionImageFile,
	parseOptionalCampaignSubmissionImage,
	type CampaignSubmissionErrorCode,
	type CampaignSubmissionImageMultipartField,
	type CampaignSubmissionImageSource,
	type CampaignSubmissionOptionalImages,
} from '@/lib/services/campaign/campaign-submission-input';
import type { CampaignSubmissionResult } from '@/lib/services/campaign/campaign-submission.service';
import { readTurnstileToken, verifyTurnstileToken } from '@/lib/services/campaign/verify-turnstile-token';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';

const personalSchema = createCampaignSubmissionPersonalSchema((code) => code);

const emptyClaimResult: ClaimPendingCampaignsResult = { successfulClaimIds: [] };

type ImageFieldError = {
	success: false;
	error: CampaignSubmissionErrorCode;
	field?: CampaignSubmissionImageMultipartField;
};

export type SubmitCampaignActionResult =
	| { success: true; data: CampaignSubmissionResult; status?: number }
	| { success: false; error: string; status?: number; field?: CampaignSubmissionImageMultipartField };

const submissionFail = (
	error: string,
	status?: number,
	field?: CampaignSubmissionImageMultipartField,
): SubmitCampaignActionResult => ({ success: false, error, status, ...(field ? { field } : {}) });

const resolveImageSource = async (
	formData: FormData,
): Promise<{ success: true; data: CampaignSubmissionImageSource } | ImageFieldError> => {
	const imageField = formData.get('primaryImage');
	const hasUpload = imageField instanceof File && imageField.size > 0;
	const defaultImageRaw = formData.get('defaultImageId');
	const hasDefaultImage = typeof defaultImageRaw === 'string' ? defaultImageRaw.trim().length > 0 : defaultImageRaw !== null;

	if (hasUpload && hasDefaultImage) {
		return { success: false, error: 'invalid-submission' };
	}

	if (hasUpload && imageField instanceof File) {
		const imageResult = await parseCampaignSubmissionImageFile(imageField);
		if (!imageResult.success) {
			return { success: false, error: imageResult.error, field: 'primaryImage' };
		}

		return {
			success: true,
			data: {
				kind: 'upload',
				image: imageResult.data,
			},
		};
	}

	if (hasDefaultImage) {
		const defaultImageIdResult = parseCampaignSubmissionDefaultImageId(defaultImageRaw);
		if (!defaultImageIdResult.success) {
			return { success: false, error: defaultImageIdResult.error, field: 'defaultImageId' };
		}

		return {
			success: true,
			data: {
				kind: 'default',
				defaultImageId: defaultImageIdResult.data,
			},
		};
	}

	return { success: false, error: 'image-required', field: 'primaryImage' };
};

const resolveOptionalImages = async (
	formData: FormData,
	hasAdditionalInformation: boolean,
): Promise<{ success: true; data: CampaignSubmissionOptionalImages } | ImageFieldError> => {
	const profilePictureResult = await parseOptionalCampaignSubmissionImage(formData, 'profilePicture');
	if (!profilePictureResult.success) {
		return { success: false, error: profilePictureResult.error, field: 'profilePicture' };
	}

	if (!hasAdditionalInformation) {
		return {
			success: true,
			data: {
				profilePicture: profilePictureResult.data,
				sectionImage: null,
			},
		};
	}

	const sectionImageResult = await parseOptionalCampaignSubmissionImage(formData, 'sectionImage');
	if (!sectionImageResult.success) {
		return { success: false, error: sectionImageResult.error, field: 'sectionImage' };
	}

	return {
		success: true,
		data: {
			profilePicture: profilePictureResult.data,
			sectionImage: sectionImageResult.data,
		},
	};
};

const readClaimIds = (claimIds: unknown): string[] => {
	if (!Array.isArray(claimIds)) {
		return [];
	}

	return claimIds.filter((claimId): claimId is string => typeof claimId === 'string');
};

export const submitCampaignAction = async (formData: FormData): Promise<SubmitCampaignActionResult> => {
	const turnstileResult = await verifyTurnstileToken(readTurnstileToken(formData));
	if (!turnstileResult.success) {
		return submissionFail(turnstileResult.error, turnstileResult.error === 'submission-failed' ? 503 : 400);
	}

	const fieldsResult = parseCampaignSubmissionFields(formData);
	if (!fieldsResult.success) {
		return submissionFail(fieldsResult.error, 400);
	}

	const imageSourceResult = await resolveImageSource(formData);
	if (!imageSourceResult.success) {
		return submissionFail(imageSourceResult.error, 400, imageSourceResult.field);
	}

	const optionalImagesResult = await resolveOptionalImages(formData, fieldsResult.data.hasAdditionalInformation);
	if (!optionalImagesResult.success) {
		return submissionFail(optionalImagesResult.error, 400, optionalImagesResult.field);
	}

	const contributor = await getOptionalContributor();
	const submissionResult = await services.campaignSubmission.submit(
		fieldsResult.data,
		imageSourceResult.data,
		optionalImagesResult.data,
		contributor?.id ?? null,
	);

	if (!submissionResult.success) {
		const errorCode = isCampaignSubmissionErrorCode(submissionResult.error) ? submissionResult.error : 'submission-failed';
		const field = isCampaignSubmissionImageErrorCode(errorCode)
			? ('defaultImageId' satisfies CampaignSubmissionImageMultipartField)
			: undefined;

		return submissionFail(errorCode, submissionResult.status ?? 400, field);
	}

	return resultOk(submissionResult.data);
};

export const ensureCampaignGuestAccountAction = async (input: unknown) => {
	const parsed = personalSchema.safeParse(input);
	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message;
		const errorCode = message && isCampaignSubmissionErrorCode(message) ? message : 'invalid-submission';

		return resultFail(errorCode, 400);
	}

	const result = await services.write.contributor.getOrCreateFromEmailAndName(parsed.data);
	if (!result.success) {
		console.error(result.error);

		return resultFail('submission-failed', 503);
	}

	return resultOk(true);
};

export const claimPendingCampaignsAction = async (claimIds: unknown) => {
	const contributorSession = await getSessionByType('contributor');
	if (!contributorSession.success) {
		return resultOk(emptyClaimResult);
	}

	const pendingClaimIds = readClaimIds(claimIds);
	if (pendingClaimIds.length === 0) {
		return resultOk(emptyClaimResult);
	}

	const result = await services.campaignPendingClaim.claimPendingCampaigns(contributorSession.data.id, pendingClaimIds);
	if (!result.success) {
		console.error(result.error);

		return resultFail('submission-failed', 503);
	}

	return resultOk(result.data);
};
