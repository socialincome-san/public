import { getUserDocFromAuthToken } from '@/firebase-admin';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const firebaseAuthToken = searchParams.get('firebaseAuthToken');
	const returnUrl = searchParams.get('returnUrl');
	if (!firebaseAuthToken || !returnUrl) {
		return new Response(null, { status: 400, statusText: 'Missing firebaseAuthToken or returnUrl' });
	}
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	const userDoc = await getUserDocFromAuthToken(firebaseAuthToken);
	const session = await stripe.billingPortal.sessions.create({
		return_url: returnUrl,
		customer: userDoc?.get('stripe_customer_id'),
		locale: userDoc?.get('language'),
	});
	return NextResponse.json(session);
}
