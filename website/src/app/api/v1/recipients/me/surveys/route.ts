import { withAppCheck } from '@/lib/firebase/with-app-check';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { SurveyService } from '@/lib/services/survey/survey.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get surveys
 * @description Returns all surveys belonging to the authenticated recipient. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @response SurveyListResponse
 * @openapi
 */
export const GET = withAppCheck(async (request: NextRequest) => {
	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const surveyService = new SurveyService();
	const surveysResult = await surveyService.getByRecipientId(recipientResult.data.id);

	if (!surveysResult.success) {
		return new Response(surveysResult.error, { status: 500 });
	}

	return NextResponse.json(surveysResult.data, { status: 200 });
});
