import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextResponse } from 'next/server';

/**
 * List payouts
 * @description Returns all payouts belonging to the authenticated recipient.
 * @auth BearerAuth
 * @response Payout
 * @openapi
 */
export async function GET(request: Request) {
	const service = new PortalApiService();

	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutsResult = await service.getPayoutsByRecipientId(recipientResult.data.id);
	if (!payoutsResult.success) {
		return new Response(payoutsResult.error, { status: payoutsResult.status ?? 500 });
	}

	return NextResponse.json(payoutsResult.data, { status: 200 });
}
