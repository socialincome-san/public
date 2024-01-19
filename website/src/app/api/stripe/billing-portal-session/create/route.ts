import { getUserDocFromAuthToken } from '@/firebase-admin';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { NextResponse } from 'next/server';

export type CreateBillingPortalSessionData = {
	returnUrl: string;
	firebaseAuthToken: string;
};

type CreateBillingPortalSessionRequest = { json(): Promise<CreateBillingPortalSessionData> } & Request;

export async function POST(request: CreateBillingPortalSessionRequest) {
	const { returnUrl, firebaseAuthToken } = await request.json();
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	const userDoc = await getUserDocFromAuthToken(firebaseAuthToken);
	if (!userDoc || !userDoc.get('stripe_customer_id')) {
		return NextResponse.json(null);
	}
	const session = await stripe.billingPortal.sessions.create({
		return_url: returnUrl,
		customer: userDoc?.get('stripe_customer_id'),
		locale: userDoc?.get('language'),
	});
	return NextResponse.json(session);
}
