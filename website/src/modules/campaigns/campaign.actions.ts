'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { getOptionalContributor } from '@/lib/firebase/current-contributor';
import { defaultLanguage, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk } from '@/lib/service-result';
import { getOrCreateContributorFromEmailAndName } from '@/modules/contributors/contributor.service';
import { getEligibleProgramsForPublicSubmission } from '@/modules/programs/program-public-submission.service';
import { revalidatePath } from 'next/cache';
import { claimPendingCampaigns } from './campaign-pending-claim.service';
import { getCampaignPageContent } from './campaign-public-website.service';
import { submitCampaign } from './campaign-submission.service';
import {
	campaignActivitySchema,
	campaignClaimIdsSchema,
	campaignIdSchema,
	campaignPortalSlugSchema,
	campaignProgramIdSchema,
	campaignPublicLanguageSchema,
	createCampaignSubmissionPersonalSchema,
} from './campaign.schemas';
import {
	getAllCampaignsForCmsJoinWithStats,
	getCampaignByPortalSlug,
	getCampaignDefaultImages,
	getDefaultCampaignForProgram,
	getPublicCampaignTitle,
} from './campaign.service';
import {
	isCampaignSubmissionErrorCode,
	isCampaignSubmissionImageErrorCode,
	parseCampaignSubmissionDefaultImageId,
	parseCampaignSubmissionFields,
	parseCampaignSubmissionImageFile,
	parseCampaignSubmissionImageFocus,
	parseOptionalCampaignSubmissionImage,
	readTurnstileToken,
	type CampaignSubmissionImageMultipartField,
	type CampaignSubmissionImageSource,
	type CampaignSubmissionOptionalImages,
	type CampaignSubmissionResult,
	type ClaimPendingCampaignsResult,
} from './campaign.types';

const personalSchema = createCampaignSubmissionPersonalSchema((code) => code);

const emptyClaimResult: ClaimPendingCampaignsResult = { successfulClaimIds: [] };

type ImageFieldError = {
	success: false;
	error: string;
	field?: CampaignSubmissionImageMultipartField;
};

export type { CampaignDefaultImageOption } from './campaign.types';

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

		const focusResult = parseCampaignSubmissionImageFocus(formData.get('primaryImageFocus'));
		if (!focusResult.success) {
			return { success: false, error: focusResult.error, field: 'primaryImage' };
		}

		return {
			success: true,
			data: {
				kind: 'upload',
				image: {
					...imageResult.data,
					focus: focusResult.data,
				},
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

	const profileFocusResult = parseCampaignSubmissionImageFocus(formData.get('profilePictureFocus'));
	if (!profileFocusResult.success) {
		return { success: false, error: profileFocusResult.error, field: 'profilePicture' };
	}

	if (!hasAdditionalInformation) {
		return {
			success: true,
			data: {
				profilePicture: profilePictureResult.data ? { ...profilePictureResult.data, focus: profileFocusResult.data } : null,
				sectionImage: null,
			},
		};
	}

	const sectionImageResult = await parseOptionalCampaignSubmissionImage(formData, 'sectionImage');
	if (!sectionImageResult.success) {
		return { success: false, error: sectionImageResult.error, field: 'sectionImage' };
	}

	const sectionFocusResult = parseCampaignSubmissionImageFocus(formData.get('sectionImageFocus'));
	if (!sectionFocusResult.success) {
		return { success: false, error: sectionFocusResult.error, field: 'sectionImage' };
	}

	return {
		success: true,
		data: {
			profilePicture: profilePictureResult.data ? { ...profilePictureResult.data, focus: profileFocusResult.data } : null,
			sectionImage: sectionImageResult.data ? { ...sectionImageResult.data, focus: sectionFocusResult.data } : null,
		},
	};
};

export const submitCampaignAction = async (formData: FormData): Promise<SubmitCampaignActionResult> => {
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
	const submissionResult = await submitCampaign(
		fieldsResult.data,
		imageSourceResult.data,
		optionalImagesResult.data,
		contributor?.id ?? null,
		readTurnstileToken(formData),
	);

	if (!submissionResult.success) {
		const errorCode = isCampaignSubmissionErrorCode(submissionResult.error) ? submissionResult.error : 'submission-failed';
		const field = isCampaignSubmissionImageErrorCode(errorCode)
			? ('defaultImageId' satisfies CampaignSubmissionImageMultipartField)
			: undefined;

		return submissionFail(errorCode, submissionResult.status ?? 400, field);
	}

	if (!contributor) {
		const personalParsed = personalSchema.safeParse({
			firstName: formData.get('firstName'),
			lastName: formData.get('lastName'),
			email: formData.get('email'),
		});
		if (personalParsed.success) {
			const accountResult = await getOrCreateContributorFromEmailAndName(personalParsed.data);
			if (!accountResult.success) {
				console.error(accountResult.error);
			}
		}
	}

	revalidatePath('/[lang]/[region]/campaigns', 'layout');

	return resultOk(submissionResult.data);
};

export const claimPendingCampaignsAction = async (claimIds: unknown) => {
	const contributorSession = await getSessionByType('contributor');
	if (!contributorSession.success) {
		return resultOk(emptyClaimResult);
	}

	const parsedClaimIds = campaignClaimIdsSchema.safeParse(claimIds);
	const pendingClaimIds = parsedClaimIds.success ? parsedClaimIds.data.filter((claimId) => typeof claimId === 'string') : [];
	if (pendingClaimIds.length === 0) {
		return resultOk(emptyClaimResult);
	}

	const result = await claimPendingCampaigns(contributorSession.data.id, pendingClaimIds);
	if (!result.success) {
		console.error(result.error);

		return resultFail('submission-failed', 503);
	}

	return resultOk(result.data);
};

export const getPublicCampaignTitleAction = async (campaignId: unknown) => {
	const parsedCampaignId = campaignIdSchema.safeParse(campaignId);
	if (!parsedCampaignId.success) {
		return resultFail(parsedCampaignId.error.issues[0]?.message ?? 'Invalid campaign id');
	}

	return getPublicCampaignTitle(parsedCampaignId.data);
};

export const getEligiblePublicSubmissionProgramsAction = async (lang: unknown) => {
	const parsedLanguage = campaignPublicLanguageSchema.safeParse(lang);
	const candidate = parsedLanguage.success ? parsedLanguage.data : '';
	const language = isWebsiteLanguage(candidate) ? candidate : defaultLanguage;

	return getEligibleProgramsForPublicSubmission(language);
};

export const getCampaignDefaultImagesAction = async () => getCampaignDefaultImages();

export const getCampaignByPortalSlugAction = async (portalSlug: unknown) => {
	const parsedSlug = campaignPortalSlugSchema.safeParse(portalSlug);
	if (!parsedSlug.success) {
		return resultFail(parsedSlug.error.issues[0]?.message ?? 'Missing campaign slug');
	}

	return getCampaignByPortalSlug(parsedSlug.data);
};

export const getAllCampaignsForCmsJoinWithStatsAction = async (activity: unknown) => {
	const parsedActivity = campaignActivitySchema.safeParse(activity);

	return getAllCampaignsForCmsJoinWithStats(parsedActivity.success ? { activity: parsedActivity.data } : undefined);
};

export const getCampaignPageContentAction = async (lang: unknown, campaignFaqs: unknown = undefined) => {
	const parsedLanguage = campaignPublicLanguageSchema.safeParse(lang);
	const candidate = parsedLanguage.success ? parsedLanguage.data : '';
	const language = isWebsiteLanguage(candidate) ? candidate : defaultLanguage;

	return getCampaignPageContent(language, campaignFaqs);
};

export const getDefaultCampaignForProgramAction = async (programId: unknown) => {
	const parsedProgramId = campaignProgramIdSchema.safeParse(programId);
	if (!parsedProgramId.success) {
		return resultFail(parsedProgramId.error.issues[0]?.message ?? 'Missing program id');
	}

	return getDefaultCampaignForProgram(parsedProgramId.data);
};

const isWebsiteLanguage = (value: string): value is WebsiteLanguage =>
	value === 'en' || value === 'de' || value === 'fr' || value === 'it' || value === 'kri';
