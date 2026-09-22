import { withAppCheck } from '@/lib/firebase/with-app-check';
import { requestOtpSchema } from '@/modules/auth/auth.schemas';
import { requestOtp } from '@/modules/auth/auth.service';

/**
 * Request OTP
 * @description Requests an OTP via Twilio SMS for the given phone number. Requires a valid Firebase App Check token.
 * @body RequestOtpRequest
 * @response 204:No Content
 * @openapi
 */
export const POST = withAppCheck(async (request: Request) => {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return new Response('Invalid JSON body', { status: 400 });
	}

	const parsed = requestOtpSchema.safeParse(body);

	if (!parsed.success) {
		return new Response(parsed.error.message, { status: 400 });
	}

	const result = await requestOtp(parsed.data.phoneNumber);

	if (!result.success) {
		return new Response(result.error, { status: result.status ?? 400 });
	}

	return new Response(null, { status: 204 });
});
