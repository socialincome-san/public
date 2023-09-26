import { authAdmin, firestoreAdmin } from '@/firebase-admin';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types/User';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const accessToken = searchParams.get('accessToken');
	const returnUrl = searchParams.get('returnUrl');
	if (!accessToken || !returnUrl) {
		return new Response(null, { status: 400, statusText: 'Missing accessToken or returnUrl' });
	}

	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	const decodedToken = await authAdmin.auth.verifyIdToken(accessToken, true);
	const userDoc = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) =>
		q.where('authUserId', '==', decodedToken.uid),
	);
	const session = await stripe.billingPortal.sessions.create({
		customer: userDoc?.get('stripe_customer_id'),
		return_url: returnUrl,
		locale: userDoc?.get('language'),
	});
	return NextResponse.json(session);
}
