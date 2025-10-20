import { RecipientUpdate } from '@/app/api/portal/v1/models';
import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextResponse } from 'next/server';

/**
 * Get recipient
 * @description Returns the authenticated recipient with all related data.
 * @response Recipient
 * @openapi
 */
export async function GET(request: Request) {
	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	return NextResponse.json(recipientResult.data, { status: 200 });
}

/**
 * Update recipient
 * @description Updates the recipient’s first and/or last name.
 * @auth BearerAuth
 * @body RecipientUpdate
 * @response Recipient
 * @openapi
 */
export async function PATCH(request: Request) {
	const service = new PortalApiService();
	const recipientResult = await service.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return new Response('Invalid JSON body', { status: 400 });
	}

	const parsed = RecipientUpdate.safeParse(body);

	if (!parsed.success) {
		return new Response(parsed.error.errors[0]?.message ?? 'Invalid input', { status: 400 });
	}

	const updateResult = await service.updateRecipientFields(recipientResult.data.id, parsed.data);

	if (!updateResult.success) {
		return new Response(updateResult.error, { status: updateResult.status ?? 500 });
	}

	return NextResponse.json(updateResult.data, { status: 200 });
}
