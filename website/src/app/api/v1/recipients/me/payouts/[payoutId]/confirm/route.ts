import { ConfirmPayoutBody } from '@/app/api/v1/models';
import { withAppCheck } from '@/lib/firebase/with-app-check';
import { PayoutService } from '@/lib/services/payout/payout.service';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ payoutId: string }>;

/**
 * Confirm payout
 * @description Marks a specific payout as confirmed by the authenticated recipient. Requires a valid Firebase App Check token.
 * @auth BearerAuth
 * @pathParams PayoutParams
 * @body ConfirmPayoutBody
 * @response 200:Payout
 * @openapi
 */
export const POST = withAppCheck(async (request: NextRequest, { params }: { params: Params }) => {
  const { payoutId } = await params;

  const recipientService = new RecipientService();
  const recipientResult = await recipientService.getRecipientFromRequest(request);

  if (!recipientResult.success) {
    logger.warn('[POST /payouts/:id/confirm] Recipient resolution failed', {
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

  const parsed = ConfirmPayoutBody.safeParse(body);

  if (!parsed.success) {
    logger.warn('[POST /payouts/:id/confirm] Validation failed', {
      zodErrors: parsed.error.format(),
    });

    return new Response(parsed.error.message, { status: 400 });
  }

  const payoutService = new PayoutService();
  const confirmResult = await payoutService.updateStatusByRecipient(
    recipientResult.data.id,
    payoutId,
    'confirmed',
    parsed.data.comments ?? null,
  );

  if (!confirmResult.success) {
    logger.error('[POST /payouts/:id/confirm] Update failed', {
      error: confirmResult.error,
      payoutId,
      recipientId: recipientResult.data.id,
    });

    return new Response(confirmResult.error, { status: 500 });
  }

  logger.info('[POST /payouts/:id/confirm] Payout confirmed', {
    payoutId,
    recipientId: recipientResult.data.id,
    hasComments: Boolean(parsed.data.comments),
  });

  return NextResponse.json(confirmResult.data, { status: 200 });
});
