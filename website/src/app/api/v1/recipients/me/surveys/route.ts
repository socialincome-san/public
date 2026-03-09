import { withAppCheck } from '@/lib/firebase/with-app-check';
import { getServices } from '@/lib/services/services';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get surveys
 * @description Returns all surveys belonging to the authenticated recipient. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @response 200:SurveyListResponse
 * @openapi
 */
export const GET = withAppCheck(async (request: NextRequest) => {
	const recipientResult = await getServices().recipientRead.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const surveysResult = await getServices().surveyRead.getByRecipientId(recipientResult.data.id);

	if (!surveysResult.success) {
		return new Response(surveysResult.error, { status: 500 });
	}

	return NextResponse.json(surveysResult.data, { status: 200 });
});
