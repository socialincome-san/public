'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { StripeContext } from '@/components/stripe/stripe-context-provider';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import {
	AddressElement,
	LinkAuthenticationElement,
	PaymentElement,
	useElements,
	useStripe,
} from '@stripe/react-stripe-js';
import { MouseEvent, PropsWithChildren, useContext, useState } from 'react';

export default function CheckoutForm({}: PropsWithChildren<DefaultPageProps>) {
	const stripe = useStripe();
	const elements = useElements();

	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { paymentIntent } = useContext(StripeContext);

	const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
		// We don't want to let default form submission happen here,
		// which would refresh the page.
		event.preventDefault();

		if (!stripe || !elements) {
			// Stripe.js has not yet loaded.
			return;
		}

		setIsLoading(true);

		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				// Make sure to change this to your payment completion page
				return_url: `${window.location.origin}/donate/success`,
			},
		});

		// This point will only be reached if there is an immediate error when
		// confirming the payment. Otherwise, your customer will be redirected to
		// your `return_url`. For some payment methods like iDEAL, your customer will
		// be redirected to an intermediate site first to authorize the payment, then
		// redirected to the `return_url`.
		if (error.type === 'card_error' || error.type === 'validation_error') {
			setMessage(error.message || 'A card error occurred.');
		} else {
			setMessage('An unexpected error occurred.');
		}

		setIsLoading(false);
	};

	if (!paymentIntent) return null;

	return (
		<BaseContainer>
			<form className="mx-auto flex max-w-3xl flex-col space-y-2">
				{/*TODO: translate properly */}
				<Typography size="2xl">Amount: {(paymentIntent.amount / 100).toFixed(2)}</Typography>
				<LinkAuthenticationElement />
				<AddressElement options={{ mode: 'billing' }} />
				<PaymentElement />
				<Button
					type="submit"
					wide
					variant="outline"
					color="secondary"
					disabled={!stripe || !elements || isLoading}
					onClick={handleSubmit}
				>
					Submit
				</Button>
			</form>
		</BaseContainer>
	);
}
