import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { SurveyService } from '@/lib/services/survey/survey.service';
import { NextResponse } from 'next/server';

/**
 * Get surveys
 * @description Returns all surveys belonging to the authenticated recipient.
 * @auth BearerAuth
 * @response SurveyListResponse
 * @openapi
 */
export async function GET(request: Request) {
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
}
