import { authAdmin, firestoreAdmin } from '@/firebase-admin';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types/user';
import _ from 'lodash';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const accessToken = searchParams.get('accessToken');
	if (!accessToken) {
		return new Response(null, { status: 400, statusText: 'Missing accessToken or returnUrl' });
	}

	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	const decodedToken = await authAdmin.auth.verifyIdToken(accessToken, true);
	const userDoc = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) =>
		q.where('authUserId', '==', decodedToken.uid),
	);

	if (_.isUndefined(userDoc)) {
		return new Response(null, { status: 400, statusText: 'User not found' });
	} else {
		return NextResponse.json(
			(await stripe.subscriptions.list({ customer: userDoc.get('stripe_customer_id'), status: 'all' })).data,
		);
	}
}
