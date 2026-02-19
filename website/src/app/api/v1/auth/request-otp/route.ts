import { withAppCheck } from '@/lib/firebase/with-app-check';
import { TwilioService } from '@/lib/services/twilio/twilio.service';
import { RequestOtpRequest } from '../../models';

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

  const parsed = RequestOtpRequest.safeParse(body);

  if (!parsed.success) {
    return new Response(parsed.error.message, { status: 400 });
  }

  const service = new TwilioService();
  const result = await service.requestOtp(parsed.data.phoneNumber);

  if (!result.success) {
    return new Response(result.error, { status: result.status ?? 400 });
  }

  return new Response(null, { status: 204 });
});
