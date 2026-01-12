import { VerifyOtpRequest } from '@/app/api/v1/models';
import { withAppCheck } from '@/lib/firebase/with-app-check';
import { TwilioService } from '@/lib/services/twilio/twilio.service';
import { NextResponse } from 'next/server';

/**
 * Verify OTP
 * @description Verifies an OTP sent via Twilio and returns a Firebase custom token for authentication. Requires a valid Firebase App Check token.
 * @body VerifyOtpRequest
 * @response 200:VerifyOtpResponse
 * @response 400:ErrorResponse
 * @response 401:Unauthorized
 * @openapi
 */
export const POST = withAppCheck(async (request: Request) => {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return new Response('Invalid JSON body', { status: 400 });
	}

	const parsed = VerifyOtpRequest.safeParse(body);

	if (!parsed.success) {
		return new Response(parsed.error.message, { status: 400 });
	}

	const service = new TwilioService();
	const result = await service.verifyOtp(parsed.data);

	if (!result.success) {
		return new Response(result.error, { status: result.status ?? 400 });
	}

	return NextResponse.json(result.data, { status: 200 });
});
