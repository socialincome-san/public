import { ContestPayoutBody } from '@/app/api/v1/models';
import { withAppCheck } from '@/lib/firebase/with-app-check';
import { PayoutService } from '@/lib/services/payout/payout.service';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

/**
 * Contest payout
 * @description Marks a specific payout as contested by the authenticated recipient. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @pathParams PayoutParams
 * @body ContestPayoutBody
 * @response 200:Payout
 * @openapi
 */
export const POST = withAppCheck(async (request: NextRequest, { params }: { params: Params }) => {
	const { payoutId } = await params;

	const recipientService = new RecipientService();
	const recipientResult = await recipientService.getRecipientFromRequest(request);

	if (!recipientResult.success) {
		logger.warn('[POST /payouts/:id/contest] Recipient resolution failed', {
			error: recipientResult.error,
			status: recipientResult.status,
		});

		return new Response(recipientResult.error, { status: recipientResult.status ?? 500 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		body = {};
	}

	const parsed = ContestPayoutBody.safeParse(body);

	if (!parsed.success) {
		logger.warn('[POST /payouts/:id/contest] Validation failed', {
			zodErrors: parsed.error.format(),
		});

		return new Response(parsed.error.message, { status: 400 });
	}

	const payoutService = new PayoutService();
	const contestResult = await payoutService.updateStatusByRecipient(
		recipientResult.data.id,
		payoutId,
		'contested',
		parsed.data.comments ?? null,
	);

	if (!contestResult.success) {
		logger.error('[POST /payouts/:id/contest] Update failed', {
			error: contestResult.error,
			payoutId,
			recipientId: recipientResult.data.id,
		});

		return new Response(contestResult.error, { status: 500 });
	}

	logger.info('[POST /payouts/:id/contest] Payout contested', {
		payoutId,
		recipientId: recipientResult.data.id,
		hasComments: Boolean(parsed.data.comments),
	});

	return NextResponse.json(contestResult.data, { status: 200 });
});
