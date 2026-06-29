'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { cn } from '@/lib/utils/cn';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getDonationWizardCardClass } from '../../utils/donation-wizard-layout';
import type { DonationWizardStepProps } from '../../wizard/types';
import { requestStripeEmbeddedCheckout } from './request-stripe-embedded-checkout';

const stripeCheckoutFrameClass = 'min-h-[520px]';

export const StripeCheckoutStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const { context } = state;
	const { stripeClientSecret, stripePublishableKey, stripeCheckoutStatus } = context;

	const isSessionReady = stripeCheckoutStatus === 'ready' && Boolean(stripeClientSecret) && Boolean(stripePublishableKey);
	const stripePromise = isSessionReady && stripePublishableKey ? loadStripe(stripePublishableKey) : null;
	const isLoading = stripeCheckoutStatus === 'loading';

	const retryCheckout = () => {
		send({ type: 'STRIPE_CHECKOUT_RETRY' });
		void requestStripeEmbeddedCheckout({ ...context, paymentMethod: 'online' }, currency, send);
	};

	return (
		<div
			className={cn(getDonationWizardCardClass('stepStripeCheckout'), 'flex w-full flex-col overflow-hidden')}
			data-testid="donation-wizard-step-stripe-checkout"
		>
			{stripeCheckoutStatus === 'error' && (
				<div className="flex flex-col gap-4 p-4">
					<div className="flex flex-col gap-2 sm:flex-row">
						<Button type="button" className="sm:order-2" onClick={retryCheckout}>
							{t('stepStripeCheckout.try-again')}
						</Button>
						<Button
							type="button"
							variant="outline"
							className="sm:order-1"
							onClick={() => send({ type: 'STRIPE_CHECKOUT_BACK' })}
						>
							{t('stepPlan.back')}
						</Button>
					</div>
				</div>
			)}

			{stripeCheckoutStatus !== 'error' && (
				<div className={cn('relative w-full', stripeCheckoutFrameClass)}>
					{isLoading && (
						<div className="flex items-center justify-center p-6">
							<p className="text-muted-foreground text-sm">{t('stepStripeCheckout.loading')}</p>
						</div>
					)}

					{isSessionReady && stripePromise && stripeClientSecret && (
						<div className="w-full [&_iframe]:w-full [&_iframe]:max-w-none">
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
						{t('stepPlan.back')}
					</Button>
				</div>
			)}
		</div>
	);
};
