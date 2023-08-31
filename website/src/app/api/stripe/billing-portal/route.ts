import { authAdmin, firestoreAdmin } from '@/firebase/admin';
import { StripeEventHandler } from '@socialincome/shared/src/stripe/StripeEventHandler';
import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const accessToken = searchParams.get('accessToken');
	const returnUrl = searchParams.get('returnUrl');
	if (!accessToken || !returnUrl) {
		return new Response(null, { status: 400, statusText: 'Missing accessToken or returnUrl' });
	}

	const decodedToken = await authAdmin.auth.verifyIdToken(accessToken, true);

	const userDoc = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) =>
		q.where('authUserId', '==', decodedToken.uid),
	);

	const stripeEventHandler = new StripeEventHandler(process.env.STRIPE_SECRET_KEY!, firestoreAdmin);
	// const stripeCustomer = await stripeEventHandler.stripe.customers.retrieve(userDoc?.get('stripe_customer_id'), {
	// 	expand: ['subscriptions'],
	// });

	const session = await stripeEventHandler.stripe.billingPortal.sessions.create({
		customer: userDoc?.get('stripe_customer_id'),
		return_url: returnUrl,
		locale: userDoc?.get('language'),
	});

	return NextResponse.json(session);
}
