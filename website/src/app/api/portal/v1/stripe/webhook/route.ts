import { StripeService } from '@socialincome/shared/src/database/services/stripe/stripe.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Process Stripe webhook events
 * @description Handles multiple Stripe webhook events including charge.succeeded, charge.updated, and charge.failed to create/update contributions and contributors.
 * @response StripeWebhookResponse | StripeWebhookError
 * @openapi
 */
export async function POST(request: NextRequest) {
	try {
		const signature = request.headers.get('stripe-signature');
		if (!signature) {
			return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
		}

		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
		if (!webhookSecret) {
			return NextResponse.json({ error: 'Missing webhook secret configuration' }, { status: 500 });
		}

		const body = Buffer.from(await request.arrayBuffer());
		const stripeService = new StripeService();

		const result = await stripeService.handleWebhookEvent(body, signature, webhookSecret);

		if (!result.success) {
			console.error('Stripe webhook error:', result.error);
			return NextResponse.json({ error: result.error }, { status: 400 });
		}

		return NextResponse.json({ received: true, data: result.data });
	} catch (error) {
		console.error('Stripe webhook error:', error);
		return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
	}
}
