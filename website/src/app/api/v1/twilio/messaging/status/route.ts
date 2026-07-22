import { services } from '@/lib/services/services';
import { logger } from '@/lib/utils/logger';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

/**
 * Twilio status callback webhook (POST /api/v1/twilio/messaging/status).
 *
 * Twilio POSTs delivery-status updates here for messages we've sent (e.g.
 * `sent`, `delivered`, `failed`, `undelivered`). We verify the request is
 * genuinely from Twilio via the `x-twilio-signature` header, then forward the
 * status to the messaging webhook service to update our records.
 */
export async function POST(request: NextRequest) {
	const signature = request.headers.get('x-twilio-signature');
	const authToken = process.env.TWILIO_AUTH_TOKEN;

	// Twilio signs the exact callback URL, so BASE_URL must be present and free of
	// a trailing slash — otherwise the reconstructed URL won't match and
	// validateRequest would reject legitimate webhooks.
	const baseUrl = process.env.BASE_URL?.replace(TRAILING_SLASHES_REGEX, '');
	if (!baseUrl) {
		logger.error('Missing BASE_URL for Twilio messaging status webhook');

		return NextResponse.json({ error: 'internal' }, { status: 500 });
	}
	const url = `${baseUrl}/api/v1/twilio/messaging/status`;

	const form = await request.formData();
	const params: Record<string, string> = {};
	for (const [key, value] of form.entries()) {
		params[key] = typeof value === 'string' ? value : '';
	}

	if (!signature || !authToken) {
		logger.warn('Missing Twilio signature or TWILIO_AUTH_TOKEN');

		return NextResponse.json({ error: 'forbidden' }, { status: 403 });
	}

	const valid = twilio.validateRequest(authToken, signature, url, params);
	if (!valid) {
		logger.warn('Invalid Twilio signature on messaging status webhook');

		return NextResponse.json({ error: 'forbidden' }, { status: 403 });
	}

	const result = await services.messagingWebhook.handleStatusCallback({
		messageSid: params.MessageSid ?? '',
		status: params.MessageStatus ?? '',
		errorCode: params.ErrorCode ?? null,
		errorMessage: params.ErrorMessage ?? null,
	});

	if (!result.success) {
		logger.error(`Webhook handler failed: ${result.error}`);

		return NextResponse.json({ error: 'internal' }, { status: 500 });
	}

	return NextResponse.json({ ok: true });
}
