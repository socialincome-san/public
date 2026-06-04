'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { createWizardPendingContributionAction } from '@/lib/server-actions/qr-wizard-actions';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getDonationDisplayAmount } from '../../utils/donation-amount';
import { donationPaymentStepCardClass } from '../../utils/donation-wizard-layout';
import { selectPaymentView } from '../../wizard/donation-machine-selectors';
import type { DonationWizardStepProps } from '../../wizard/types';
import { QrWizardStepFooter } from '../step-qr-contact/qr-wizard-step-footer';
import { QrBillPaymentCard } from './qr-bill-payment-card';

export const QrBillStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const view = selectPaymentView(state.context);
	const [confirming, setConfirming] = useState(false);

	const { qrBillSvg, qrDonor, qrContributorReferenceId, qrContributionReferenceId } = state.context;
	const displayAmount = getDonationDisplayAmount(state.context);

	const paymentTypeLabel =
		state.context.cadence === 'monthly' ? t('stepQrBill.paymentTypeStandingOrder') : t('stepQrBill.paymentTypeOneTime');

	const confirmLabel =
		state.context.cadence === 'monthly' ? t('stepQrBill.confirmStandingOrder') : t('stepQrBill.confirmOneTime');

	const donorName = qrDonor ? `${qrDonor.firstName} ${qrDonor.lastName}` : '';
	const amountLabel = `${currency} ${displayAmount}`;

	const onConfirm = async () => {
		if (!qrDonor || !qrContributorReferenceId || !qrContributionReferenceId) {
			toast.error(t('stepQrBill.confirmError'));

			return;
		}

		setConfirming(true);

		try {
			const result = await createWizardPendingContributionAction({
				wizardContext: state.context,
				contributionReferenceId: qrContributionReferenceId,
				userData: {
					email: qrDonor.email,
					firstName: qrDonor.firstName,
					lastName: qrDonor.lastName,
					language: qrDonor.language,
					paymentReferenceId: qrContributorReferenceId,
				},
				currency,
			});

			if (!result.success) {
				toast.error(t('stepQrBill.confirmError'));
				setConfirming(false);

				return;
			}

			send({ type: 'QR_PAYMENT_CONFIRMED' });
		} catch {
			toast.error(t('stepQrBill.confirmError'));
			setConfirming(false);
		}
	};

	if (!qrBillSvg) {
		return null;
	}

	return (
		<div className={cn(donationPaymentStepCardClass, 'text-foreground flex w-full flex-col gap-5 overflow-visible')}>
			<h3 className="text-lg leading-7 font-medium">{t('stepQrBill.title')}</h3>

			<QrBillPaymentCard
				qrBillSvg={qrBillSvg}
				donorName={donorName}
				amountLabel={amountLabel}
				paymentTypeLabel={paymentTypeLabel}
			/>

			<QrWizardStepFooter
				showBack={false}
				onContinue={() => void onConfirm()}
				continueLabel={confirming ? t('stepQrBill.confirming') : confirmLabel}
				continueDisabled={confirming}
				continueClassName="bg-foreground text-primary-foreground shadow-xs after:opacity-0 hover:bg-foreground/90 hover:after:opacity-0"
				summary={{
					amount: view.summary.amount,
					currency,
					showPerMonth: view.summary.showPerMonth,
				}}
			/>
		</div>
	);
};
