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
		// TEMPORARY for testing: render the wallet buttons even without a card set up. Revert to 'auto' before merging.
		applePay: 'always',
		googlePay: 'always',
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
	// The checkout session is created once this turns true, so visitors who never see the bar create none.
	active: boolean;
	// Whether Stripe reported Apple Pay or Google Pay for this donation
	hasWallet: boolean;
	onWalletChange: (hasWallet: boolean) => void;
	// Shown until Stripe reports a wallet, and instead of the wallet button when there is none
	fallback: ReactNode;
	onConfirm: (paymentMethod: string) => void;
	onPaid: (sessionId: string) => void;
};

export const WalletButton = ({
	donation,
	currency,
	active,
	hasWallet,
	onWalletChange,
	fallback,
	onConfirm,
	onPaid,
}: Props) => {
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		if (!active || session) {
			return;
		}

		let cancelled = false;
		void createStripeEmbeddedCheckoutAction({
			wizardContext: donation,
			currency,
			returnPath: buildStripeCheckoutReturnPath(),
			uiMode: 'elements',
		}).then((result) => {
			if (cancelled || !result.success) {
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
	}, [active, session, donation, currency]);

	return (
		<div className="relative h-10 w-40">
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
						onAvailable={() => onWalletChange(true)}
						onConfirm={onConfirm}
						onPaid={onPaid}
						onFailed={() => {
							// A failed session, e.g. an expired one, cannot be retried; the next showing creates a new one.
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
	onAvailable: () => void;
	onConfirm: (paymentMethod: string) => void;
	onPaid: (sessionId: string) => void;
	onFailed: () => void;
};

const ExpressCheckout = ({ sessionId, donation, onAvailable, onConfirm, onPaid, onFailed }: ExpressCheckoutProps) => {
	const checkoutResult = useCheckoutElements();

	return (
		<ExpressCheckoutElement
			options={expressCheckoutOptions}
			onReady={(event) => {
				// TEMPORARY for testing: shows which wallets Stripe found for this browser. Remove before merging.
				console.info('[ECE] wallets available:', event.availablePaymentMethods);
				if (event.availablePaymentMethods?.applePay || event.availablePaymentMethods?.googlePay) {
					onAvailable();
				}
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
