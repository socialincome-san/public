import { CreateCheckoutSessionData } from '@/app/api/stripe/checkout-session/create/route';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { useI18n } from '@/lib/i18n/useI18n';
import { Button } from '@socialincome/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Stripe from 'stripe';

type StripePaymentButtonProps = {
	amount: number;
	intervalCount: number;
	lang: string;
	region: string;
	buttonText: string;
};

export function StripePaymentButton({ amount, intervalCount, lang, region, buttonText }: StripePaymentButtonProps) {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const { authUser } = useAuth();
	const { currency } = useI18n();

	const handlePayment = async () => {
		setSubmitting(true);
		const authToken = await authUser?.getIdToken(true);
		const data: CreateCheckoutSessionData = {
			amount: amount * 100,
			intervalCount: intervalCount,
			currency: currency,
			successUrl: `${window.location.origin}/${lang}/${region}/donate/success/stripe/{CHECKOUT_SESSION_ID}`,
			recurring: true,
			firebaseAuthToken: authToken,
		};
		// Call the API to create a new Stripe checkout session
		const response = await fetch('/api/stripe/checkout-session/create', { method: 'POST', body: JSON.stringify(data) });
		const { url } = (await response.json()) as Stripe.Response<Stripe.Checkout.Session>;
		// This sends the user to stripe.com where payment is completed
		if (url) router.push(url);
	};

	return (
		<Button size="lg" type="button" className="w-full" showLoadingSpinner={submitting} onClick={handlePayment}>
			{buttonText}
		</Button>
	);
}
