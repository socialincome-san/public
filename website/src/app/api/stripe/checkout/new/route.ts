import { initializeStripe } from '@socialincome/shared/src/stripe';
import { NextResponse } from 'next/server';

export type CreateSubscriptionData = {
	amount: number; // in the lowest currency unit, e.g. cents
	successUrl: string;
	currency?: string;
	intervalCount?: number;
};

type CreateSubscriptionRequest = { json(): Promise<CreateSubscriptionData> } & Request;

export async function POST(request: CreateSubscriptionRequest) {
	const { amount, currency = 'USD', intervalCount = 1, successUrl } = await request.json();
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	const plan = await stripe.plans.create({
		active: true,
		amount: amount,
		currency: currency,
		interval: 'month',
		interval_count: intervalCount,
		product: process.env.STRIPE_PRODUCT_ID,
	});
	const session = await stripe.checkout.sessions.create({
		mode: 'subscription',
		payment_method_types: ['card'],
		line_items: [
			{
				price: plan.id,
				quantity: 1,
			},
		],
		success_url: successUrl,
		locale: 'auto',
	});
	return NextResponse.json(session);
}
