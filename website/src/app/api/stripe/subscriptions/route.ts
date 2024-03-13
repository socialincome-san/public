import { getUserDocFromAuthToken } from '@/firebase-admin';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const firebaseAuthToken = searchParams.get('firebaseAuthToken');
	if (!firebaseAuthToken) {
		return new Response(null, { status: 403, statusText: 'Missing firebaseAuthToken' });
	}
	const userDoc = await getUserDocFromAuthToken(firebaseAuthToken);
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	if (!userDoc || !userDoc.get('stripe_customer_id')) {
		return NextResponse.json(null);
	} else {
		return NextResponse.json(
			(await stripe.subscriptions.list({ customer: userDoc.get('stripe_customer_id'), status: 'all' })).data,
		);
	}
}
