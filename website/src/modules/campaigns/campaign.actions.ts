'use server';

import { getSessionAuditContext } from '@/lib/audit/audit-context';
import type { AuditContext } from '@/lib/audit/audit-types';
import { defaultLanguage, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { getOptionalContributor, getSessionByType } from '@/modules/auth/session.service';
import { getOrCreateContributorFromEmailAndName } from '@/modules/contributors/contributor.service';
import { getEligibleProgramsForPublicSubmission } from '@/modules/programs/program-public-submission.service';
import type { PublicSubmissionProgramOption } from '@/modules/programs/program.types';
import { STORYBLOK_CACHE_TAG } from '@/modules/storyblok-content/storyblok-content.cache';
import { revalidatePath, updateTag } from 'next/cache';
import { getOwnCampaignForEdit, updateOwnCampaign } from './campaign-edit.service';
import { claimPendingCampaigns } from './campaign-pending-claim.service';
import { getCampaignPageContent } from './campaign-public-website.service';
import { submitCampaign } from './campaign-submission.service';
import { getAllCampaignsForCmsJoinWithStats, getCampaignByPortalSlug, getDefaultCampaignForProgram } from './campaign.cache';
import {
	campaignActivitySchema,
	campaignClaimIdsSchema,
	campaignIdSchema,
	campaignPortalSlugSchema,
	campaignProgramIdSchema,
	campaignPublicLanguageSchema,
	createCampaignSubmissionPersonalSchema,
	isCampaignSubmissionErrorCode,
	isCampaignSubmissionImageErrorCode,
	parseCampaignSubmissionDefaultImageId,
	parseCampaignSubmissionFields,
	parseCampaignSubmissionImageFile,
	parseCampaignSubmissionImageFocus,
	parseCampaignUpdateFields,
	parseFormDataFlag,
	parseOptionalCampaignSubmissionImage,
	readTurnstileToken,
} from './campaign.schemas';
import { getCampaignDefaultImages, getPublicCampaignTitle } from './campaign.service';
import {
	CAMPAIGN_CACHE_TAG,
	type CampaignCmsJoinWithStats,
	type CampaignDefaultImageOption,
	type CampaignPage,
	type CampaignPageContent,
	type CampaignReference,
	type CampaignSubmissionImageMultipartField,
	type CampaignSubmissionImageSource,
	type CampaignSubmissionOptionalImages,
	type CampaignSubmissionResult,
	type CampaignUpdateImages,
	type CampaignUpdateOptionalImage,
	type ClaimPendingCampaignsResult,
	type EditableCampaign,
} from './campaign.types';

const personalSchema = createCampaignSubmissionPersonalSchema((code) => code);

const emptyClaimResult: ClaimPendingCampaignsResult = { successfulClaimIds: [] };

type ImageFieldError = {
	success: false;
	error: string;
	field?: CampaignSubmissionImageMultipartField;
};

export type { CampaignDefaultImageOption } from './campaign.types';

type CampaignSubmissionActionFailure = {
	success: false;
	error: string;
	status?: number;
	field?: CampaignSubmissionImageMultipartField;
};

const submissionFail = (
	error: string,
	status?: number,
	field?: CampaignSubmissionImageMultipartField,
): CampaignSubmissionActionFailure => ({ success: false, error, status, ...(field ? { field } : {}) });

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

// Guests submit campaigns without a session.
const campaignSubmissionAudit: AuditContext = { actor: { type: 'system', id: 'campaign-submission' }, source: 'system' };

export const submitCampaignAction = async (
	formData: FormData,
): Promise<Result<CampaignSubmissionResult, CampaignSubmissionActionFailure>> => {
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

	const contributorResult = await getOptionalContributor();
	const contributor = contributorResult.success ? contributorResult.data : null;
	const submissionResult = await submitCampaign(
		contributor ? getSessionAuditContext(contributor) : campaignSubmissionAudit,
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
			const accountResult = await getOrCreateContributorFromEmailAndName(campaignSubmissionAudit, personalParsed.data);
			if (!accountResult.success) {
				console.error(accountResult.error);
			}
		}
	}

	revalidatePath('/[lang]/[currency]/campaigns', 'layout');

	return resultOk(submissionResult.data);
};

const resolveUpdateOptionalImage = async (
	formData: FormData,
	field: 'profilePicture' | 'sectionImage',
	removeFlag: 'removeProfilePicture' | 'removeSectionImage',
): Promise<{ success: true; data: CampaignUpdateOptionalImage } | ImageFieldError> => {
	if (parseFormDataFlag(formData.get(removeFlag))) {
		return { success: true, data: { kind: 'remove' } };
	}

	const imageResult = await parseOptionalCampaignSubmissionImage(formData, field);
	if (!imageResult.success) {
		return { success: false, error: imageResult.error, field };
	}
	if (!imageResult.data) {
		return { success: true, data: { kind: 'keep' } };
	}

	const focusResult = parseCampaignSubmissionImageFocus(formData.get(`${field}Focus`));
	if (!focusResult.success) {
		return { success: false, error: focusResult.error, field };
	}

	return { success: true, data: { kind: 'replace', image: { ...imageResult.data, focus: focusResult.data } } };
};

const resolveUpdateImages = async (
	formData: FormData,
): Promise<{ success: true; data: CampaignUpdateImages } | ImageFieldError> => {
	const hasNewPrimaryImage = formData.has('primaryImage') || formData.has('defaultImageId');
	const primaryImageResult = hasNewPrimaryImage
		? await resolveImageSource(formData)
		: { success: true as const, data: { kind: 'keep' as const } };
	if (!primaryImageResult.success) {
		return primaryImageResult;
	}

	const profilePictureResult = await resolveUpdateOptionalImage(formData, 'profilePicture', 'removeProfilePicture');
	if (!profilePictureResult.success) {
		return profilePictureResult;
	}

	const sectionImageResult = await resolveUpdateOptionalImage(formData, 'sectionImage', 'removeSectionImage');
	if (!sectionImageResult.success) {
		return sectionImageResult;
	}

	return {
		success: true,
		data: {
			primaryImage: primaryImageResult.data,
			profilePicture: profilePictureResult.data,
			sectionImage: sectionImageResult.data,
		},
	};
};

export const getOwnCampaignForEditAction = async (campaignId: unknown): Promise<Result<EditableCampaign>> => {
	const contributorSession = await getSessionByType('contributor');
	if (!contributorSession.success) {
		return resultFail('campaign-not-found', 404);
	}

	const parsedCampaignId = campaignIdSchema.safeParse(campaignId);
	if (!parsedCampaignId.success) {
		return resultFail('campaign-not-found', 404);
	}

	return getOwnCampaignForEdit(contributorSession.data.id, parsedCampaignId.data);
};

export const updateOwnCampaignAction = async (
	formData: FormData,
): Promise<Result<{ slug: string }, CampaignSubmissionActionFailure>> => {
	const contributorSession = await getSessionByType('contributor');
	if (!contributorSession.success) {
		return submissionFail('campaign-not-found', 404);
	}

	const campaignIdResult = campaignIdSchema.safeParse(formData.get('campaignId'));
	if (!campaignIdResult.success) {
		return submissionFail('campaign-not-found', 404);
	}

	const fieldsResult = parseCampaignUpdateFields(formData);
	if (!fieldsResult.success) {
		return submissionFail(fieldsResult.error, 400);
	}

	const imagesResult = await resolveUpdateImages(formData);
	if (!imagesResult.success) {
		return submissionFail(imagesResult.error, 400, imagesResult.field);
	}

	const result = await updateOwnCampaign(
		getSessionAuditContext(contributorSession.data),
		contributorSession.data.id,
		campaignIdResult.data,
		fieldsResult.data,
		imagesResult.data,
	);
	if (!result.success) {
		const errorCode = isCampaignSubmissionErrorCode(result.error) ? result.error : 'submission-failed';
		const field = isCampaignSubmissionImageErrorCode(errorCode)
			? ('defaultImageId' satisfies CampaignSubmissionImageMultipartField)
			: undefined;

		return submissionFail(errorCode, result.status ?? 400, field);
	}

	updateTag(CAMPAIGN_CACHE_TAG);
	// The edited text lives in Storyblok; without this it only shows once Storyblok's publish webhook arrives.
	updateTag(STORYBLOK_CACHE_TAG);

	return resultOk(result.data);
};

export const claimPendingCampaignsAction = async (claimIds: unknown): Promise<Result<ClaimPendingCampaignsResult>> => {
	const contributorSession = await getSessionByType('contributor');
	if (!contributorSession.success) {
		return resultOk(emptyClaimResult);
	}

	const parsedClaimIds = campaignClaimIdsSchema.safeParse(claimIds);
	const pendingClaimIds = parsedClaimIds.success ? parsedClaimIds.data.filter((claimId) => typeof claimId === 'string') : [];
	if (pendingClaimIds.length === 0) {
		return resultOk(emptyClaimResult);
	}

	const result = await claimPendingCampaigns(
		getSessionAuditContext(contributorSession.data),
		contributorSession.data.id,
		pendingClaimIds,
	);
	if (!result.success) {
		console.error(result.error);

		return resultFail('submission-failed', 503);
	}

	return resultOk(result.data);
};

export const getPublicCampaignTitleAction = async (campaignId: unknown): Promise<Result<{ title: string }>> => {
	const parsedCampaignId = campaignIdSchema.safeParse(campaignId);
	if (!parsedCampaignId.success) {
		return resultFail('Invalid campaign id');
	}

	return getPublicCampaignTitle(parsedCampaignId.data);
};

export const getEligiblePublicSubmissionProgramsAction = async (
	lang: unknown,
): Promise<Result<PublicSubmissionProgramOption[]>> => {
	const parsedLanguage = campaignPublicLanguageSchema.safeParse(lang);
	const candidate = parsedLanguage.success ? parsedLanguage.data : '';
	const language = isWebsiteLanguage(candidate) ? candidate : defaultLanguage;

	return getEligibleProgramsForPublicSubmission(language);
};

export const getCampaignDefaultImagesAction = async (): Promise<Result<CampaignDefaultImageOption[]>> =>
	getCampaignDefaultImages();

export const getCampaignByPortalSlugAction = async (portalSlug: unknown): Promise<Result<CampaignPage>> => {
	const parsedSlug = campaignPortalSlugSchema.safeParse(portalSlug);
	if (!parsedSlug.success) {
		return resultFail('Missing campaign slug');
	}

	return getCampaignByPortalSlug(parsedSlug.data);
};

export const getAllCampaignsForCmsJoinWithStatsAction = async (
	activity: unknown,
): Promise<Result<CampaignCmsJoinWithStats>> => {
	const parsedActivity = campaignActivitySchema.safeParse(activity);

	return getAllCampaignsForCmsJoinWithStats(parsedActivity.success ? { activity: parsedActivity.data } : undefined);
};

export const getCampaignPageContentAction = async (
	lang: unknown,
	campaignFaqs: unknown = undefined,
): Promise<Result<CampaignPageContent>> => {
	const parsedLanguage = campaignPublicLanguageSchema.safeParse(lang);
	const candidate = parsedLanguage.success ? parsedLanguage.data : '';
	const language = isWebsiteLanguage(candidate) ? candidate : defaultLanguage;

	return getCampaignPageContent(language, campaignFaqs);
};

export const getDefaultCampaignForProgramAction = async (programId: unknown): Promise<Result<CampaignReference>> => {
	const parsedProgramId = campaignProgramIdSchema.safeParse(programId);
	if (!parsedProgramId.success) {
		return resultFail('Missing program id');
	}

	return getDefaultCampaignForProgram(parsedProgramId.data);
};

const isWebsiteLanguage = (value: string): value is WebsiteLanguage =>
	value === 'en' || value === 'de' || value === 'fr' || value === 'it' || value === 'kri';
