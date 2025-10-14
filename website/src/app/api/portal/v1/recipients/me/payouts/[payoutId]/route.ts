import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

/**
 * Get payout by ID
 * @description Returns a specific payout belonging to the authenticated recipient.
 * @auth BearerAuth
 * @param {string} payoutId - The ID of the payout to retrieve (path parameter)
 * @response Payout
 * @openapi
 */
export async function GET(request: NextRequest, { params }: { params: Params }) {
	const { payoutId } = await params;
	const service = new PortalApiService();

	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutResult = await service.getPayoutByRecipientAndId(recipientResult.data.id, payoutId);
	if (!payoutResult.success) {
		return new Response(payoutResult.error, { status: payoutResult.status ?? 500 });
	}

	return NextResponse.json(payoutResult.data, { status: 200 });
}
