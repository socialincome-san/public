import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { defaultLanguage } from '@/lib/i18n/utils';
import {
	isCampaignSubmissionErrorCode,
	parseCampaignSubmissionFields,
	validateCampaignSubmissionImageBuffer,
	type CampaignSubmissionErrorCode,
} from '@/lib/services/campaign/campaign-submission-input';
import { services } from '@/lib/services/services';
import { parseMultipartFormDataWithLimit, RequestBodyTooLargeError } from '@/lib/utils/request-body';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const errorResponse = (errorCode: CampaignSubmissionErrorCode, status: number) =>
	NextResponse.json({ errorCode }, { status });

const getPublishedProgramPortalSlugs = async (): Promise<string[]> => {
	const programsResult = await services.storyblok.getPrograms(defaultLanguage);
	if (!programsResult.success) {
		return [];
	}

	return [...new Set(programsResult.data.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))];
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

	const imageField = formData.get('primaryImage');
	if (!(imageField instanceof File)) {
		return errorResponse('image-required', 400);
	}

	const imageBuffer = Buffer.from(await imageField.arrayBuffer());
	const imageResult = validateCampaignSubmissionImageBuffer(imageBuffer, imageField.type, imageField.name);
	if (!imageResult.success) {
		return errorResponse(imageResult.error, 400);
	}

	const publishedProgramPortalSlugs = await getPublishedProgramPortalSlugs();
	const submissionResult = await services.campaignSubmission.submit(
		fieldsResult.data,
		{ ...imageResult.data, buffer: imageBuffer },
		publishedProgramPortalSlugs,
	);

	if (!submissionResult.success) {
		const errorCode = isCampaignSubmissionErrorCode(submissionResult.error) ? submissionResult.error : 'submission-failed';

		return errorResponse(errorCode, submissionResult.status ?? 400);
	}

	return NextResponse.json({ slug: submissionResult.data.slug }, { status: 201 });
};
