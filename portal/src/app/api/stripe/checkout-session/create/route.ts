import { getUserDocFromAuthToken, handleApiError } from '@/app/api/auth';
import { WebsiteCurrency } from '@/i18n';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { NextResponse } from 'next/server';

export type CreateCheckoutSessionData = {
	amount: number; // in the lowest currency unit, e.g. cents
	successUrl: string;
	recurring?: boolean;
	currency?: WebsiteCurrency;
	intervalCount?: number;
	firebaseAuthToken?: string;
	campaignId?: string; // to optionally associate a payment to a fundraising campaign.
};

type CreateCheckoutSessionRequest = { json(): Promise<CreateCheckoutSessionData> } & Request;

export async function POST(request: CreateCheckoutSessionRequest) {
	const {
		amount,
		currency = 'USD',
		intervalCount = 1,
		successUrl,
		recurring = false,
		firebaseAuthToken,
		campaignId,
	} = await request.json();
	try {
		const userDoc = firebaseAuthToken ? await getUserDocFromAuthToken(firebaseAuthToken) : null;
		const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
		const customerId = userDoc?.get('stripe_customer_id');
		const price = await stripe.prices.create({
			active: true,
			unit_amount: amount,
			currency: currency.toLowerCase(),
			product: recurring ? process.env.STRIPE_PRODUCT_RECURRING : process.env.STRIPE_PRODUCT_ONETIME,
			recurring: recurring ? { interval: 'month', interval_count: intervalCount } : undefined,
		});
		const metadata = campaignId
			? {
					campaignId: campaignId,
				}
			: undefined;

		const session = await stripe.checkout.sessions.create({
			mode: recurring ? 'subscription' : 'payment',
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
			metadata: metadata,
		});
		return NextResponse.json(session);
	} catch (error: any) {
		handleApiError(error);
	}
}
