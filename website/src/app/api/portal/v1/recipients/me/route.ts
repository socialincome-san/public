import { RecipientUpdate } from '@/app/api/portal/v1/models';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import { NextResponse } from 'next/server';

/**
 * Get recipient
 * @description Returns the authenticated recipient with all related data.
 * @response Recipient
 * @openapi
 */
export async function GET(request: Request) {
	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

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
	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

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

	// Use the existing update method with contact update structure
	const updateResult = await recipientService.update('', {
		id: recipientResult.data.id,
		contact: {
			update: {
				firstName: parsed.data.firstName,
				lastName: parsed.data.lastName,
			},
		},
	});

	if (!updateResult.success) {
		return new Response(updateResult.error, { status: 500 });
	}

	return NextResponse.json(updateResult.data, { status: 200 });
}
