import { getUserDocFromAuthToken } from '@/firebase-admin';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { NextResponse } from 'next/server';

export type CreateSubscriptionData = {
	amount: number; // in the lowest currency unit, e.g. cents
	successUrl: string;
	recurring?: boolean;
	currency?: string;
	intervalCount?: number;
	firebaseAuthToken?: string;
};

type CreateSubscriptionRequest = { json(): Promise<CreateSubscriptionData> } & Request;

export async function POST(request: CreateSubscriptionRequest) {
	const {
		amount,
		currency = 'USD',
		intervalCount = 1,
		successUrl,
		recurring = false,
		firebaseAuthToken,
	} = await request.json();
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	const userDoc = await getUserDocFromAuthToken(firebaseAuthToken);
	const price = await stripe.prices.create({
		active: true,
		unit_amount: amount,
		currency: currency,
		product: process.env.STRIPE_PRODUCT_ID,
		recurring: recurring ? { interval: 'month', interval_count: intervalCount } : undefined,
	});
	const session = await stripe.checkout.sessions.create({
		mode: recurring ? 'subscription' : 'payment',
		payment_method_types: ['card'],
		customer: userDoc?.get('stripe_customer_id'),
		line_items: [
			{
				price: price.id,
				quantity: 1,
			},
		],
		success_url: successUrl,
		locale: 'auto',
	});
	return NextResponse.json(session);
}
