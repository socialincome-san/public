import { initializeStripe } from '@socialincome/shared/src/stripe';
import { NextResponse } from 'next/server';

interface PaymentIntentRequest extends Request {
	json(): Promise<{ amount: number; currency: string }>;
}

export async function POST(request: PaymentIntentRequest) {
	const { amount, currency } = await request.json();
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);

	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount,
			currency: currency,
		});
		return NextResponse.json(paymentIntent);
	} catch (error: any) {
		return new NextResponse(error, {
			status: 400,
		});
	}
}
