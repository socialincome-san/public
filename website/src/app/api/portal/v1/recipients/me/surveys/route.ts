import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextResponse } from 'next/server';

/**
 * Get surveys
 * @description Returns all surveys belonging to the authenticated recipient.
 * @auth BearerAuth
 * @response Survey
 * @openapi
 */
export async function GET(request: Request) {
	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const surveysResult = await service.getSurveysByRecipientId(recipientResult.data.id);

	if (!surveysResult.success) {
		return new Response(surveysResult.error, { status: surveysResult.status ?? 500 });
	}

	return NextResponse.json(surveysResult.data, { status: 200 });
}
