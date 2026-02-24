import { withAppCheck } from '@/lib/firebase/with-app-check';
import { services } from '@/lib/services/services';
import { NextRequest, NextResponse } from 'next/server';

/**
 * List payouts
 * @description Returns all payouts belonging to the authenticated recipient. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @response 200:PayoutListResponse
 * @openapi
 */
export const GET = withAppCheck(async (request: NextRequest) => {
	const recipientResult = await services.recipient.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutsResult = await services.payout.getByRecipientId(recipientResult.data.id);

	if (!payoutsResult.success) {
		return new Response(payoutsResult.error, { status: 500 });
	}

	return NextResponse.json(payoutsResult.data, { status: 200 });
});
