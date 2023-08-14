'use client';

import { createContext, Dispatch, PropsWithChildren, SetStateAction, useState } from 'react';
import Stripe from 'stripe';

interface StripeContextProps {
	amount: number;
	setAmount: Dispatch<SetStateAction<number>>;
	paymentIntent?: Stripe.Response<Stripe.PaymentIntent>;
	setPaymentIntent: Dispatch<SetStateAction<Stripe.Response<Stripe.PaymentIntent> | undefined>>;
}

export const StripeContext = createContext<StripeContextProps>({
	amount: 0,
	setAmount: () => {},
	paymentIntent: undefined,
	setPaymentIntent: () => {},
});

export default function StripeContextProvider({ children }: PropsWithChildren) {
	const [amount, setAmount] = useState<number>(100);
	const [paymentIntent, setPaymentIntent] = useState<Stripe.Response<Stripe.PaymentIntent>>();

	return (
		<StripeContext.Provider
			value={{
				amount,
				setAmount,
				paymentIntent,
				setPaymentIntent,
			}}
		>
			{children}
		</StripeContext.Provider>
	);
}
