import { DefaultPageProps } from '@/app/[lang]/[country]';
import PaymentIntentFetcher from '@/components/stripe/payment-intent-fetcher';
import StripeContextProvider from '@/components/stripe/stripe-context-provider';
import CheckoutForm from './checkout-form';

export default function Page({ params, searchParams }: DefaultPageProps) {
	// The amount is in cents, so we need to multiply by 100 to get the correct amount.
	// https://stripe.com/docs/api/payment_intents/object#payment_intent_object-amount
	const requestAmount = Math.round(Number(searchParams.amount) * 100);

	return (
		<StripeContextProvider>
			<PaymentIntentFetcher amount={requestAmount} currency="USD">
				<CheckoutForm searchParams={searchParams} params={params} />
			</PaymentIntentFetcher>
		</StripeContextProvider>
	);
}
