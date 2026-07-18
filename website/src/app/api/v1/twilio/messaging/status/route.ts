import { services } from '@/lib/services/services';
import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
	const signature = request.headers.get('x-twilio-signature');
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const url = `${process.env.BASE_URL}/api/v1/twilio/messaging/status`;

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
