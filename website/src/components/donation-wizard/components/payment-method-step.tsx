'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { cn } from '@/lib/utils/cn';
import { donationPaymentStepCardClass } from '../donation-wizard-layout';
import { getDonationDisplayAmount } from '../wizard/donation-amount';
import type { DonationWizardStepProps } from '../wizard/types';
import { CoverTransactionCostsToggle } from './cover-transaction-costs-toggle';
import { DonationStepFooter } from './donation-step-footer';
import { OnlinePaymentLogos, QrPaymentLogo } from './payment-method-logos';
import { PaymentMethodOption } from './payment-method-option';

export const PaymentMethodStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const { paymentMethod, cadence, coverTransactionCosts } = state.context;
	const displayAmount = getDonationDisplayAmount(state.context);

	return (
		<div className={cn(donationPaymentStepCardClass, 'text-foreground')}>
			<h3 className="mb-4 text-base font-medium sm:text-lg">{t('step3.title')}</h3>

			<div className="mb-5 flex flex-col gap-3">
				<PaymentMethodOption
					label={t('step3.qr-payment')}
					badge={t('step3.minimal-costs')}
					selected={paymentMethod === 'qr'}
					onSelect={() => send({ type: 'SET_PAYMENT_METHOD', value: 'qr' })}
					trailing={<QrPaymentLogo />}
				/>
				<PaymentMethodOption
					label={t('step3.online')}
					selected={paymentMethod === 'online'}
					onSelect={() => send({ type: 'SET_PAYMENT_METHOD', value: 'online' })}
					trailing={<OnlinePaymentLogos />}
				/>
			</div>

			{paymentMethod === 'online' && (
				<div className="mb-5">
					<CoverTransactionCostsToggle
						cadence={cadence}
						checked={coverTransactionCosts}
						onCheckedChange={(value) => send({ type: 'SET_COVER_TRANSACTION_COSTS', value })}
					/>
				</div>
			)}

			<DonationStepFooter
				onBack={() => send({ type: 'BACK' })}
				onContinue={() => send({ type: 'COMPLETE' })}
				continueLabel={paymentMethod === 'qr' ? t('step3.generate-qr-code') : t('step3.pay-online')}
				summary={{
					amount: displayAmount,
					currency,
					showPerMonth: cadence === 'monthly',
				}}
			/>
		</div>
	);
};
