import { services } from '@/lib/services/services';
import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	try {
		const signature = request.headers.get('stripe-signature');
		if (!signature) {
			return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
		}

		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
		if (!webhookSecret) {
			console.error(`${SLACK_ALERT}: Missing Stripe webhook secret configuration`);

			return NextResponse.json({ error: 'Missing webhook secret configuration' }, { status: 500 });
		}

		const body = await request.text();
		const result = await services.stripe.handleWebhookEvent(body, signature, webhookSecret);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error(`${SLACK_ALERT}: Stripe webhook error`, { error });

		return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
	}
};
