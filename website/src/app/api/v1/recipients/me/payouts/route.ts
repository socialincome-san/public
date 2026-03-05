import { withAppCheck } from '@/lib/firebase/with-app-check';
import { PayoutReadService } from '@/lib/services/payout/payout-read.service';
import { RecipientReadService } from '@/lib/services/recipient/recipient-read.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * List payouts
 * @description Returns all payouts belonging to the authenticated recipient. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @response 200:PayoutListResponse
 * @openapi
 */
export const GET = withAppCheck(async (request: NextRequest) => {
	const recipientService = new RecipientReadService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutService = new PayoutReadService();
	const payoutsResult = await payoutService.getByRecipientId(recipientResult.data.id);

	if (!payoutsResult.success) {
		return new Response(payoutsResult.error, { status: 500 });
	}

	return NextResponse.json(payoutsResult.data, { status: 200 });
});
