'use client';

import { createStripeEmbeddedCheckoutAction } from '@/modules/stripe-payments/stripe-payment.actions';
import { CheckoutElementsProvider, ExpressCheckoutElement, useCheckoutElements } from '@stripe/react-stripe-js/checkout';
import type { Stripe, StripeCheckoutExpressCheckoutElementOptions } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { useEffect, useState, type ReactNode } from 'react';
import {
	buildStripeCheckoutReturnPath,
	clearStoredStripeCheckoutContext,
	storeStripeCheckoutContext,
} from '../steps/step-stripe-checkout/stripe-checkout-return';
import type { DonationAmountContext } from '../utils/donation-amount';

// One button only: Apple Pay when the device has it, otherwise Google Pay.
const expressCheckoutOptions: StripeCheckoutExpressCheckoutElementOptions = {
	buttonHeight: 40,
	buttonTheme: { applePay: 'black', googlePay: 'black' },
	buttonType: { applePay: 'plain', googlePay: 'plain' },
	layout: { maxColumns: 1, maxRows: 1, overflow: 'auto' },
	paymentMethodOrder: ['apple_pay', 'google_pay'],
	paymentMethods: {
		applePay: 'auto',
		googlePay: 'auto',
		link: 'never',
		paypal: 'never',
		amazonPay: 'never',
		klarna: 'never',
	},
};

type Session = {
	clientSecret: string;
	sessionId: string;
	stripe: Promise<Stripe | null>;
};

type Props = {
	donation: DonationAmountContext;
	currency: string;
	// Whether Stripe reported Apple Pay or Google Pay for this donation
	hasWallet: boolean;
	// Called once Stripe has checked for a wallet, and again if a payment fails
	onWalletChange: (hasWallet: boolean) => void;
	// Shown until Stripe reports a wallet, and instead of the wallet button when there is none
	fallback: ReactNode;
	onConfirm: (paymentMethod: string) => void;
	onPaid: (sessionId: string) => void;
};

export const WalletButton = ({ donation, currency, hasWallet, onWalletChange, fallback, onConfirm, onPaid }: Props) => {
	const [session, setSession] = useState<Session | null>(null);

	// Starts as soon as a donation is stored, while the bar is still hidden, so it can appear with its final button.
	useEffect(() => {
		if (session) {
			return;
		}

		let cancelled = false;
		void createStripeEmbeddedCheckoutAction({
			wizardContext: donation,
			currency,
			returnPath: buildStripeCheckoutReturnPath(),
			uiMode: 'elements',
		}).then((result) => {
			if (cancelled) {
				return;
			}
			if (!result.success) {
				onWalletChange(false);

				return;
			}
			setSession({
				clientSecret: result.data.clientSecret,
				sessionId: result.data.sessionId,
				// With test keys (previews), Stripe.js otherwise floats its developer assistant over the page.
				stripe: loadStripe(result.data.publishableKey, { developerTools: { assistant: { enabled: false } } }),
			});
		});

		return () => {
			cancelled = true;
		};
	}, [session, donation, currency, onWalletChange]);

	return (
		<div className="relative h-10 w-44">
			{session ? (
				<CheckoutElementsProvider
					stripe={session.stripe}
					options={{
						clientSecret: session.clientSecret,
						elementsOptions: { appearance: { variables: { borderRadius: '9999px' } } },
					}}
				>
					<ExpressCheckout
						sessionId={session.sessionId}
						donation={donation}
						onWalletChange={onWalletChange}
						onConfirm={onConfirm}
						onPaid={onPaid}
						onFailed={() => {
							// A failed session, e.g. an expired one, cannot be retried, so a new one is created.
							setSession(null);
							onWalletChange(false);
						}}
					/>
				</CheckoutElementsProvider>
			) : null}
			{hasWallet ? null : <div className="absolute inset-0">{fallback}</div>}
		</div>
	);
};

type ExpressCheckoutProps = {
	sessionId: string;
	donation: DonationAmountContext;
	onWalletChange: (hasWallet: boolean) => void;
	onConfirm: (paymentMethod: string) => void;
	onPaid: (sessionId: string) => void;
	onFailed: () => void;
};

const ExpressCheckout = ({ sessionId, donation, onWalletChange, onConfirm, onPaid, onFailed }: ExpressCheckoutProps) => {
	const checkoutResult = useCheckoutElements();

	return (
		<ExpressCheckoutElement
			options={expressCheckoutOptions}
			onReady={(event) => {
				const wallets = event.availablePaymentMethods;
				onWalletChange(wallets !== undefined && (wallets.applePay || wallets.googlePay));
			}}
			onConfirm={(event) => {
				if (checkoutResult.type !== 'success') {
					event.paymentFailed();

					return;
				}

				onConfirm(event.expressPaymentType);
				// If the bank asks for authentication, Stripe redirects and the provider continues from the return URL.
				storeStripeCheckoutContext(sessionId, donation);
				void checkoutResult.checkout
					.confirm({ expressCheckoutConfirmEvent: event, redirect: 'if_required' })
					.then((result) => {
						clearStoredStripeCheckoutContext(sessionId);
						if (result.type === 'success') {
							onPaid(sessionId);
						} else {
							console.warn('Wallet payment failed', { code: result.error.code });
							onFailed();
						}
					})
					.catch((error: unknown) => {
						console.error('Wallet payment could not be confirmed', { error });
						clearStoredStripeCheckoutContext(sessionId);
						event.paymentFailed();
						onFailed();
					});
			}}
		/>
	);
};
