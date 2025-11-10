import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

/**
 * Confirm payout
 * @description Marks a specific payout as confirmed by the authenticated recipient.
 * @auth BearerAuth
 * @param {string} payoutId - The ID of the payout to retrieve (path parameter)
 * @response Payout
 * @openapi
 */
export async function POST(request: NextRequest, { params }: { params: Params }) {
	const { payoutId } = await params;

	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutService = new PayoutService();
	const confirmResult = await payoutService.updateStatusByRecipient(recipientResult.data.id, payoutId, 'confirmed');

	if (!confirmResult.success) {
		return new Response(confirmResult.error, { status: 500 });
	}

	return NextResponse.json(confirmResult.data, { status: 200 });
}
