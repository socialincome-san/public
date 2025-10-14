import { PortalApiService } from '@socialincome/shared/src/database/services/portal-api/portal-api.service';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

/**
 * Contest payout
 * @description Marks a specific payout as contested by the authenticated recipient.
 * @auth BearerAuth
 * @param {string} payoutId - The ID of the payout to retrieve (path parameter)
 * @response Payout
 * @openapi
 */
export async function POST(request: NextRequest, { params }: { params: Params }) {
	const { payoutId } = await params;

	const service = new PortalApiService();

	const recipientResult = await service.getRecipientFromRequest(request);
	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const contestResult = await service.updatePayoutStatus(recipientResult.data.id, payoutId, 'contested');
	if (!contestResult.success) {
		return new Response(contestResult.error, { status: contestResult.status ?? 500 });
	}

	return NextResponse.json(contestResult.data, { status: 200 });
}
