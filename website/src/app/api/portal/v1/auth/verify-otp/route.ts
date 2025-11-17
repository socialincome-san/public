import { VerifyOtpRequest } from '@/app/api/portal/v1/models';
import { TwilioService } from '@socialincome/shared/src/database/services/twilio/twilio.service';
import { NextResponse } from 'next/server';

/**
 * Verify OTP
 * @description Verifies an OTP sent via Twilio and returns a Firebase custom token for authentication.
 * @body VerifyOtpRequest
 * @response 200:VerifyOtpResponse
 * @response 400:ErrorResponse
 * @openapi
 */
export async function POST(request: Request) {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return new Response('Invalid JSON body', { status: 400 });
	}

	const parsed = VerifyOtpRequest.safeParse(body);

	if (!parsed.success) {
		return new Response(parsed.error.errors[0]?.message ?? 'Invalid input', { status: 400 });
	}

	const service = new TwilioService();
	const result = await service.verifyOtp(parsed.data);

	if (!result.success) {
		return new Response(result.error, { status: result.status ?? 400 });
	}

	return NextResponse.json(result.data, { status: 200 });
}
