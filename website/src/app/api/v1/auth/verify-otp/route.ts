import { withAppCheck } from '@/lib/firebase/with-app-check';
import { verifyOtpSchema } from '@/modules/auth/auth.schemas';
import { verifyOtp } from '@/modules/auth/auth.service';
import { NextResponse } from 'next/server';

/**
 * Verify OTP
 * @description Verifies an OTP sent via Twilio and returns a Firebase custom token for authentication. Requires a valid Firebase App Check token.
 * @body VerifyOtpRequest
 * @response 200:VerifyOtpResponse
 * @openapi
 */
export const POST = withAppCheck(async (request: Request) => {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return new Response('Invalid JSON body', { status: 400 });
	}

	const parsed = verifyOtpSchema.safeParse(body);

	if (!parsed.success) {
		return new Response(parsed.error.message, { status: 400 });
	}

	const result = await verifyOtp(parsed.data);

	if (!result.success) {
		return new Response(result.error, { status: result.status ?? 400 });
	}

	return NextResponse.json(result.data, { status: 200 });
});
