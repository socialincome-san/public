import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { defaultLanguage } from '@/lib/i18n/utils';
import {
	parseCampaignSubmissionFields,
	validateCampaignSubmissionImageBuffer,
} from '@/lib/services/campaign/campaign-submission-input';
import { services } from '@/lib/services/services';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const getPublishedProgramPortalSlugs = async (): Promise<string[]> => {
	const programsResult = await services.storyblok.getPrograms(defaultLanguage);
	if (!programsResult.success) {
		return [];
	}

	return [...new Set(programsResult.data.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))];
};

export const POST = async (request: NextRequest) => {
	const contentLength = Number(request.headers.get('content-length') ?? 0);
	if (contentLength > campaignSubmissionConfig.maxMultipartBodyBytes) {
		return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
	}

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
	}

	const fieldsResult = parseCampaignSubmissionFields(formData);
	if (!fieldsResult.success) {
		return NextResponse.json({ error: fieldsResult.error }, { status: 400 });
	}

	const imageField = formData.get('primaryImage');
	if (!(imageField instanceof File)) {
		return NextResponse.json({ error: 'Primary image is required.' }, { status: 400 });
	}

	const imageBuffer = Buffer.from(await imageField.arrayBuffer());
	const imageResult = validateCampaignSubmissionImageBuffer(imageBuffer, imageField.type, imageField.name);
	if (!imageResult.success) {
		return NextResponse.json({ error: imageResult.error }, { status: 400 });
	}

	const publishedProgramPortalSlugs = await getPublishedProgramPortalSlugs();
	const submissionResult = await services.campaignSubmission.submit(
		fieldsResult.data,
		{ ...imageResult.data, buffer: imageBuffer },
		publishedProgramPortalSlugs,
	);

	if (!submissionResult.success) {
		return NextResponse.json({ error: submissionResult.error }, { status: submissionResult.status ?? 400 });
	}

	return NextResponse.json({ slug: submissionResult.data.slug }, { status: 201 });
};
