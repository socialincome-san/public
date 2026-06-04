'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { donationPaymentStepCardClass } from '../../utils/donation-wizard-layout';
import type { DonationWizardStepProps } from '../../wizard/types';
import { requestStripeEmbeddedCheckout } from './request-stripe-embedded-checkout';

const stripeCheckoutFrameClass = 'min-h-[520px]';

export const StripeCheckoutStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const { context } = state;
	const { stripeClientSecret, stripePublishableKey, stripeCheckoutStatus, stripeCheckoutError } = context;

	const isSessionReady = stripeCheckoutStatus === 'ready' && Boolean(stripeClientSecret) && Boolean(stripePublishableKey);
	const stripePromise = isSessionReady && stripePublishableKey ? loadStripe(stripePublishableKey) : null;
	const isLoading = stripeCheckoutStatus === 'loading';

	const retryCheckout = () => {
		send({ type: 'STRIPE_CHECKOUT_RETRY' });
		void requestStripeEmbeddedCheckout(context, currency, send);
	};

	return (
		<div className={donationPaymentStepCardClass}>
			{stripeCheckoutStatus === 'error' && (
				<div className="flex flex-col gap-4 p-4">
					<p className="text-destructive text-sm">{stripeCheckoutError ?? t('step4.payment-error')}</p>
					<div className="flex gap-2">
						<Button type="button" variant="outline" onClick={() => send({ type: 'STRIPE_CHECKOUT_BACK' })}>
							{t('step2.back')}
						</Button>
						<Button type="button" onClick={retryCheckout}>
							{t('step4.try-again')}
						</Button>
					</div>
				</div>
			)}

			{stripeCheckoutStatus !== 'error' && (
				<div className={`relative ${stripeCheckoutFrameClass}`}>
					{isLoading && (
						<div className="flex items-center justify-center p-6">
							<p className="text-muted-foreground text-sm">{t('step4.loading')}</p>
						</div>
					)}

					{isSessionReady && stripePromise && stripeClientSecret && (
						<div className="w-full p-2 sm:p-4">
							<EmbeddedCheckoutProvider
								key={stripeClientSecret}
								stripe={stripePromise}
								options={{
									clientSecret: stripeClientSecret,
									onComplete: () => send({ type: 'STRIPE_CHECKOUT_COMPLETE' }),
								}}
							>
								<EmbeddedCheckout />
							</EmbeddedCheckoutProvider>
						</div>
					)}
				</div>
			)}

			{stripeCheckoutStatus !== 'error' && (
				<div className="border-border flex justify-start border-t px-4 py-3 sm:px-6">
					<Button
						type="button"
						variant="outline"
						disabled={isLoading}
						onClick={() => send({ type: 'STRIPE_CHECKOUT_BACK' })}
					>
						{t('step2.back')}
					</Button>
				</div>
			)}
		</div>
	);
};
