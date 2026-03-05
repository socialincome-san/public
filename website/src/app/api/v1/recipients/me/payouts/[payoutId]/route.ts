import { withAppCheck } from '@/lib/firebase/with-app-check';
import { PayoutReadService } from '@/lib/services/payout/payout-read.service';
import { RecipientReadService } from '@/lib/services/recipient/recipient-read.service';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

/**
 * Get payout by ID
 * @description Returns a specific payout belonging to the authenticated recipient. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @pathParams PayoutParams
 * @response 200:Payout
 * @openapi
 */
export const GET = withAppCheck(async (request: NextRequest, { params }: { params: Params }) => {
	const { payoutId } = await params;

	const recipientService = new RecipientReadService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutService = new PayoutReadService();
	const payoutResult = await payoutService.getByRecipientAndId(recipientResult.data.id, payoutId);

	if (!payoutResult.success) {
		return new Response(payoutResult.error, { status: 500 });
	}

	if (!payoutResult.data) {
		return new Response(`Payout "${payoutId}" not found for recipient`, { status: 404 });
	}

	return NextResponse.json(payoutResult.data, { status: 200 });
});
