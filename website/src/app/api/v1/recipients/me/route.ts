import { withAppCheck } from '@/lib/firebase/with-app-check';
import { recipientSelfUpdateSchema } from '@/modules/recipients/recipient.schemas';
import { getAuthenticatedRecipientFromRequest, updateRecipientSelf } from '@/modules/recipients/recipient.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get recipient
 * @description Returns the authenticated recipient with all related data. Requires a valid Firebase App Check token.
 * @response 200:Recipient
 * @openapi
 */
export const GET = withAppCheck(async (request: NextRequest) => {
	const recipientResult = await getAuthenticatedRecipientFromRequest(request);

	if (!recipientResult.success) {
		console.warn('[GET /recipients/me] Failed', {
			error: recipientResult.error,
			status: recipientResult.status,
		});

		return new Response(recipientResult.error, {
			status: recipientResult.status ?? 500,
		});
	}

	return NextResponse.json(recipientResult.data, { status: 200 });
});

/**
 * Update recipient
 * @description Updates the authenticated recipient’s personal information, contact details, and mobile money payment information. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @body RecipientSelfUpdate
 * @response 200:Recipient
 * @openapi
 */
export const PATCH = withAppCheck(async (request: NextRequest) => {
	console.info('[PATCH /recipients/me] Incoming request', {
		contentType: request.headers.get('content-type'),
	});

	const recipientResult = await getAuthenticatedRecipientFromRequest(request);

	if (!recipientResult.success) {
		console.warn('[PATCH /recipients/me] Recipient resolution failed', {
			error: recipientResult.error,
			status: recipientResult.status,
		});

		return new Response(recipientResult.error, {
			status: recipientResult.status ?? 500,
		});
	}

	const recipient = recipientResult.data;

	let body: unknown;

	try {
		body = await request.json();
	} catch {
		console.warn('[PATCH /recipients/me] Invalid JSON body');

		return new Response('Invalid JSON body', { status: 400 });
	}

	const parsed = recipientSelfUpdateSchema.safeParse(body);

	if (!parsed.success) {
		console.warn('[PATCH /recipients/me] Validation failed', {
			zodErrors: parsed.error.format(),
		});

		return new Response(parsed.error.message, { status: 400 });
	}

	const oldPaymentPhone = recipient.paymentInformation?.phone?.number ?? null;
	const newPaymentPhone = parsed.data.paymentPhone ?? null;
	let contactPhoneState: 'provided' | 'unchanged' | null = 'unchanged';
	if (parsed.data.contactPhone === null) {
		contactPhoneState = null;
	} else if (typeof parsed.data.contactPhone === 'string') {
		contactPhoneState = 'provided';
	}

	console.info('[PATCH /recipients/me] Phone update intent', {
		oldPaymentPhone,
		newPaymentPhone,
		contactPhone: contactPhoneState,
	});

	const updateResult = await updateRecipientSelf(recipient.id, parsed.data);

	if (!updateResult.success) {
		console.error('[PATCH /recipients/me] Update failed', {
			error: updateResult.error,
		});

		return new Response(updateResult.error, { status: 500 });
	}

	console.info('[PATCH /recipients/me] Update successful', {
		recipientId: recipient.id,
	});

	return NextResponse.json(updateResult.data, { status: 200 });
});
