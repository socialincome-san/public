import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import {
	isCampaignSubmissionErrorCode,
	isCampaignSubmissionImageErrorCode,
	parseCampaignSubmissionDefaultImageId,
	parseCampaignSubmissionFields,
	parseOptionalCampaignSubmissionImage,
	validateCampaignSubmissionImageBuffer,
	type CampaignSubmissionErrorCode,
	type CampaignSubmissionImageMultipartField,
	type CampaignSubmissionImageSource,
	type CampaignSubmissionOptionalImages,
} from '@/lib/services/campaign/campaign-submission-input';
import { services } from '@/lib/services/services';
import { parseMultipartFormDataWithLimit, RequestBodyTooLargeError } from '@/lib/utils/request-body';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ImageFieldError = {
	success: false;
	error: CampaignSubmissionErrorCode;
	field?: CampaignSubmissionImageMultipartField;
};

const errorResponse = (
	errorCode: CampaignSubmissionErrorCode,
	status: number,
	field?: CampaignSubmissionImageMultipartField,
) => NextResponse.json(field ? { errorCode, field } : { errorCode }, { status });

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
		const imageBuffer = Buffer.from(await imageField.arrayBuffer());
		const imageResult = validateCampaignSubmissionImageBuffer(imageBuffer, imageField.type, imageField.name);
		if (!imageResult.success) {
			return { success: false, error: imageResult.error, field: 'primaryImage' };
		}

		return {
			success: true,
			data: {
				kind: 'upload',
				image: {
					...imageResult.data,
					buffer: imageBuffer,
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

export const POST = async (request: NextRequest) => {
	let formData: FormData;
	try {
		formData = await parseMultipartFormDataWithLimit(request, campaignSubmissionConfig.maxMultipartBodyBytes);
	} catch (error) {
		if (error instanceof RequestBodyTooLargeError) {
			return errorResponse('payload-too-large', 413);
		}

		return errorResponse('invalid-form-data', 400);
	}

	const fieldsResult = parseCampaignSubmissionFields(formData);
	if (!fieldsResult.success) {
		return errorResponse(fieldsResult.error, 400);
	}

	const imageSourceResult = await resolveImageSource(formData);
	if (!imageSourceResult.success) {
		return errorResponse(imageSourceResult.error, 400, imageSourceResult.field);
	}

	const optionalImagesResult = await resolveOptionalImages(formData, fieldsResult.data.hasAdditionalInformation);
	if (!optionalImagesResult.success) {
		return errorResponse(optionalImagesResult.error, 400, optionalImagesResult.field);
	}

	const submissionResult = await services.campaignSubmission.submit(
		fieldsResult.data,
		imageSourceResult.data,
		optionalImagesResult.data,
	);

	if (!submissionResult.success) {
		const errorCode = isCampaignSubmissionErrorCode(submissionResult.error) ? submissionResult.error : 'submission-failed';
		const field = isCampaignSubmissionImageErrorCode(errorCode)
			? ('defaultImageId' satisfies CampaignSubmissionImageMultipartField)
			: undefined;

		return errorResponse(errorCode, submissionResult.status ?? 400, field);
	}

	return NextResponse.json({ slug: submissionResult.data.slug }, { status: 201 });
};
