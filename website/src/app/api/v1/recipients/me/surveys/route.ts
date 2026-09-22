import { withAppCheck } from '@/lib/firebase/with-app-check';
import { getAuthenticatedRecipientFromRequest } from '@/modules/recipients/recipient.service';
import { getSurveysByRecipientId } from '@/modules/surveys/survey.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get surveys
 * @description Returns all surveys belonging to the authenticated recipient. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @response 200:SurveyListResponse
 * @openapi
 */
export const GET = withAppCheck(async (request: NextRequest) => {
	const recipientResult = await getAuthenticatedRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const surveysResult = await getSurveysByRecipientId(recipientResult.data.id);

	if (!surveysResult.success) {
		return new Response(surveysResult.error, { status: 500 });
	}

	return NextResponse.json(surveysResult.data, { status: 200 });
});
