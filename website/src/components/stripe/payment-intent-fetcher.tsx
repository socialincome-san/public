'use client';

import { PropsWithChildren, useContext, useEffect } from 'react';

import { StripeContext } from '@/components/stripe/stripe-context-provider';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentIntentFetcherProps {
	amount: number; // in smallest currency unit, e.g. cents
	currency: string;
}

export default function PaymentIntentFetcher({
	children,
	amount,
	currency,
}: PropsWithChildren<PaymentIntentFetcherProps>) {
	const { paymentIntent, setPaymentIntent } = useContext(StripeContext);

	useEffect(() => {
		fetch('/api/stripe/payment-intent', {
			method: 'POST',
			body: JSON.stringify({ amount, currency }),
		}).then((response) => response.json().then((data) => setPaymentIntent(data)));
	}, [amount, currency, setPaymentIntent]);

	if (!paymentIntent?.client_secret) return <div>Loading...</div>;

	return (
		<Elements stripe={stripePromise} options={{ clientSecret: paymentIntent?.client_secret }}>
			{children}
		</Elements>
	);
}
