import { StripeService } from '@/lib/services/stripe/stripe.service';
import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	try {
		const signature = request.headers.get('stripe-signature');
		if (!signature) {
			return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
		}

		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
		if (!webhookSecret) {
			return NextResponse.json({ error: 'Missing webhook secret configuration' }, { status: 500 });
		}

		const body = await request.text();
		const stripeService = new StripeService();
		const result = await stripeService.handleWebhookEvent(body, signature, webhookSecret);

		if (!result.success) {
			logger.alert(
				`Stripe webhook processing failed: ${result.error}`,
				{ error: result.error, signature: signature?.slice(0, 20) + '...' },
				{ component: 'stripe-webhook' },
			);
			return NextResponse.json({ error: result.error }, { status: 400 });
		}

		return NextResponse.json({ received: true, data: result.data });
	} catch (error) {
		logger.alert('Stripe webhook error', { error }, { component: 'stripe-webhook' });
		return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
	}
}
