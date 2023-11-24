import { getUserDocFromAuthToken } from '@/firebase-admin';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import _ from 'lodash';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const firebaseAuthToken = searchParams.get('firebaseAuthToken');
	if (!firebaseAuthToken) {
		return new Response(null, { status: 400, statusText: 'Missing firebaseAuthToken or returnUrl' });
	}
	const userDoc = await getUserDocFromAuthToken(firebaseAuthToken);
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	if (_.isUndefined(userDoc)) {
		return new Response(null, { status: 400, statusText: 'User not found' });
	} else {
		return NextResponse.json(
			(await stripe.subscriptions.list({ customer: userDoc.get('stripe_customer_id'), status: 'all' })).data,
		);
	}
}
