import { getUserDocFromAuthToken } from '@/firebase-admin';
import { WebsiteCurrency } from '@/i18n';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { NextResponse } from 'next/server';

export type CreatePaymentData = {
	amount: number; // in the lowest currency unit, e.g. cents
	successUrl: string;
	recurring?: boolean;
	currency?: WebsiteCurrency;
	intervalCount?: number;
	firebaseAuthToken?: string;
};

type CreateSubscriptionRequest = { json(): Promise<CreatePaymentData> } & Request;

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
	const customerId = userDoc?.get('stripe_customer_id');
	const price = await stripe.prices.create({
		active: true,
		unit_amount: amount,
		currency: currency,
		product: recurring ? process.env.STRIPE_PRODUCT_RECURRING : process.env.STRIPE_PRODUCT_ONETIME,
		recurring: recurring ? { interval: 'month', interval_count: intervalCount } : undefined,
	});
	const session = await stripe.checkout.sessions.create({
		mode: recurring ? 'subscription' : 'payment',
		payment_method_types: ['card'],
		customer: customerId,
		customer_creation: customerId || recurring ? undefined : 'always',
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
