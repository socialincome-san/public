'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { cn } from '@/lib/utils/cn';
import { DonationStepFooter } from '../../shared/donation-step-footer';
import { OnlinePaymentLogos } from '../../shared/payment-logos/online-payment-logos';
import { QrPaymentLogo } from '../../shared/payment-logos/qr-payment-logo';
import { donationPaymentStepCardClass } from '../../utils/donation-wizard-layout';
import { selectPaymentView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { CoverTransactionCostsToggle } from './cover-transaction-costs-toggle';
import { PaymentMethodOption } from './payment-method-option';

export const PaymentMethodStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const view = selectPaymentView(state.context);

	return (
		<div className={cn(donationPaymentStepCardClass, 'text-foreground')}>
			<h3 className="mb-4 text-base font-medium sm:text-lg">{t('step3.title')}</h3>

			<div className="mb-5 flex flex-col gap-3">
				<PaymentMethodOption
					label={t('step3.qr-payment')}
					badge={t('step3.minimal-costs')}
					selected={view.paymentMethod === 'qr'}
					onSelect={() => send({ type: 'SET_PAYMENT_METHOD', value: 'qr' })}
					trailing={<QrPaymentLogo />}
				/>
				<PaymentMethodOption
					label={t('step3.online')}
					selected={view.paymentMethod === 'online'}
					onSelect={() => send({ type: 'SET_PAYMENT_METHOD', value: 'online' })}
					trailing={<OnlinePaymentLogos />}
				/>
			</div>

			{view.showTransactionCostToggle && (
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
				onContinue={() => send({ type: 'COMPLETE' })}
				continueLabel={t(view.continueLabelKey)}
				summary={{
					amount: view.summary.amount,
					currency,
					showPerMonth: view.summary.showPerMonth,
				}}
			/>
		</div>
	);
};
