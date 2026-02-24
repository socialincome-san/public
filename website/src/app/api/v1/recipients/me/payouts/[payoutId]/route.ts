import { withAppCheck } from '@/lib/firebase/with-app-check';
import { services } from '@/lib/services/services';
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

	const recipientResult = await services.recipient.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	const payoutResult = await services.payout.getByRecipientAndId(recipientResult.data.id, payoutId);

	if (!payoutResult.success) {
		return new Response(payoutResult.error, { status: 500 });
	}

	if (!payoutResult.data) {
		return new Response(`Payout "${payoutId}" not found for recipient`, { status: 404 });
	}

	return NextResponse.json(payoutResult.data, { status: 200 });
});
