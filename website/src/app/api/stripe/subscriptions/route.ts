import { authorizeRequest, handleApiError } from '@/app/api/auth';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const userDoc = await authorizeRequest(request);
		const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
		if (!userDoc.get('stripe_customer_id')) {
			return NextResponse.json(null);
		} else {
			return NextResponse.json(
				(await stripe.subscriptions.list({ customer: userDoc.get('stripe_customer_id'), status: 'all' })).data,
			);
		}
	} catch (error: any) {
		return handleApiError(error);
	}
}
