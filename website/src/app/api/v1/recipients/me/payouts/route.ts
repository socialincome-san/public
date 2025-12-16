import { PayoutService } from '@/lib/services/payout/payout.service';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { NextResponse } from 'next/server';

/**
 * List payouts
 * @description Returns all payouts belonging to the authenticated recipient.
 * @auth BearerAuth
 * @response PayoutListResponse
 * @openapi
 */
export async function GET(request: Request) {
	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutService = new PayoutService();
	const payoutsResult = await payoutService.getByRecipientId(recipientResult.data.id);

	if (!payoutsResult.success) {
		return new Response(payoutsResult.error, { status: 500 });
	}

	return NextResponse.json(payoutsResult.data, { status: 200 });
}
