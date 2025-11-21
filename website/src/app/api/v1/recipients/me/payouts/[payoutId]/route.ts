import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

/**
 * Get payout by ID
 * @description Returns a specific payout belonging to the authenticated recipient.
 * @auth BearerAuth
 * @pathParams PayoutParams
 * @response Payout
 * @openapi
 */
export async function GET(request: NextRequest, { params }: { params: Params }) {
	const { payoutId } = await params;

	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutService = new PayoutService();
	const payoutResult = await payoutService.getByRecipientAndId(recipientResult.data.id, payoutId);

	if (!payoutResult.success) {
		return new Response(payoutResult.error, { status: 500 });
	}

	if (!payoutResult.data) {
		return new Response(`Payout "${payoutId}" not found for recipient`, { status: 404 });
	}

	return NextResponse.json(payoutResult.data, { status: 200 });
}
