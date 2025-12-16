import { PayoutService } from '@/lib/services/payout/payout.service';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

/**
 * Contest payout
 * @description Marks a specific payout as contested by the authenticated recipient.
 * @auth BearerAuth
 * @pathParams PayoutParams
 * @response Payout
 * @openapi
 */
export async function POST(request: NextRequest, { params }: { params: Params }) {
	const { payoutId } = await params;

	// todo add reason
	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutService = new PayoutService();
	const contestResult = await payoutService.updateStatusByRecipient(recipientResult.data.id, payoutId, 'contested');

	if (!contestResult.success) {
		return new Response(contestResult.error, { status: 500 });
	}

	return NextResponse.json(contestResult.data, { status: 200 });
}
