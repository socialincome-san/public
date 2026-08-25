import {
	createCampaignSubmissionPersonalSchema,
	isCampaignSubmissionErrorCode,
	type CampaignSubmissionErrorCode,
} from '@/lib/services/campaign/campaign-submission-input';
import { services } from '@/lib/services/services';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const personalSchema = createCampaignSubmissionPersonalSchema((code) => code);

const errorResponse = (errorCode: CampaignSubmissionErrorCode, status: number) =>
	NextResponse.json({ errorCode }, { status });

export const POST = async (request: NextRequest) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorResponse('invalid-submission', 400);
	}

	const parsed = personalSchema.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message;
		const errorCode =
			message && isCampaignSubmissionErrorCode(message) ? message : ('invalid-submission' satisfies CampaignSubmissionErrorCode);

		return errorResponse(errorCode, 400);
	}

	const result = await services.write.contributor.getOrCreateFromEmailAndName(parsed.data);
	if (!result.success) {
		console.error(result.error);

		return errorResponse('submission-failed', 503);
	}

	return NextResponse.json({ ok: true }, { status: 200 });
};
