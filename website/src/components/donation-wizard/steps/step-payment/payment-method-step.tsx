'use client';

import { OnlinePaymentLogos } from '@/components/payment-logos/online-payment-logos';
import { QrPaymentLogo } from '@/components/payment-logos/qr-payment-logo';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { isWizardQrCurrencySupported } from '@/lib/services/qr-bill/wizard-qr-payment';
import { cn } from '@/lib/utils/cn';
import { DonationStepFooter } from '../../shared/donation-step-footer';
import { donationPaymentStepCardClass } from '../../utils/donation-wizard-layout';
import { selectPaymentView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { requestStripeEmbeddedCheckout } from '../step-stripe-checkout/request-stripe-embedded-checkout';
import { CoverTransactionCostsToggle } from './cover-transaction-costs-toggle';
import { PaymentMethodOption } from './payment-method-option';

export const PaymentMethodStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const view = selectPaymentView(state.context);
	const isQrAvailable = isWizardQrCurrencySupported(currency);
	const paymentMethod = view.paymentMethod === 'qr' && !isQrAvailable ? ('online' as const) : view.paymentMethod;

	return (
		<div className={cn(donationPaymentStepCardClass, 'text-foreground')} data-testid="donation-wizard-step-payment">
			<h3 className="mb-4 text-base font-medium sm:text-lg">{t('stepPayment.title')}</h3>

			<div className="mb-5 flex flex-col gap-3">
				<PaymentMethodOption
					label={t('stepPayment.qr-payment')}
					badge={t('stepPayment.minimal-costs')}
					selected={paymentMethod === 'qr'}
					disabled={!isQrAvailable}
					disabledReason={!isQrAvailable ? t('stepPayment.qr-payment-unavailable') : undefined}
					onSelect={() => send({ type: 'SET_PAYMENT_METHOD', value: 'qr' })}
					trailing={<QrPaymentLogo />}
					testId="donation-wizard-payment-qr"
				/>
				<PaymentMethodOption
					label={t('stepPayment.online')}
					selected={paymentMethod === 'online'}
					onSelect={() => send({ type: 'SET_PAYMENT_METHOD', value: 'online' })}
					trailing={<OnlinePaymentLogos />}
					testId="donation-wizard-payment-online"
				/>
			</div>

			{paymentMethod === 'online' && (
				<div className="mb-5">
					<CoverTransactionCostsToggle
						cadence={view.cadence}
						currency={currency}
						transactionCost={view.transactionCost}
						checked={view.coverTransactionCosts}
						onCheckedChange={(value) => send({ type: 'SET_COVER_TRANSACTION_COSTS', value })}
					/>
				</div>
			)}

			<DonationStepFooter
				onBack={() => send({ type: 'BACK' })}
				onContinue={() => {
					if (paymentMethod === 'online') {
						if (view.paymentMethod !== 'online') {
							send({ type: 'SET_PAYMENT_METHOD', value: 'online' });
						}
						send({ type: 'START_STRIPE_CHECKOUT' });
						void requestStripeEmbeddedCheckout({ ...state.context, paymentMethod: 'online' }, currency, send);

						return;
					}

					send({ type: 'START_QR_FLOW' });
				}}
				continueLabel={t(paymentMethod === 'qr' ? 'stepPayment.generate-qr-code' : 'stepPayment.pay-online')}
				summary={{
					amount: view.summary.amount,
					currency,
					showPerMonth: view.summary.showPerMonth,
				}}
			/>
		</div>
	);
};
