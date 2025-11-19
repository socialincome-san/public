import { generateQrBillSvg } from '@/utils/qr-bill';
import { BankTransferPayment } from '@socialincome/shared/src/database/services/bank-transfer/bank-transfer-service';
import { BankContributorData } from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { createContributionForContributor, getReferenceIds } from '../server-actions/bank-transfer-action';

type UseBankTransferProps = {
	amount: number;
	intervalCount: number;
	currency: string;
	qrBillType: 'QRCODE' | 'QRBILL';
	translations: {
		errors: {
			qrBillError: string;
			paymentFailed: string;
		};
	};
};

export function useBankTransfer({ amount, intervalCount, currency, qrBillType, translations }: UseBankTransferProps) {
	const [userData, setUserData] = useState<BankContributorData | null>(null);
	const [contributionReference, setContributionReference] = useState<string | null>(null);
	const [qrBillSvg, setQrBillSvg] = useState<string | null>(null);
	const [isLoading, startTransition] = useTransition();
	const [paid, setPaid] = useState(false);

	const generateQRCode = async (email: string, firstName: string, lastName: string) => {
		if (!currency) {
			toast.error(translations.errors.qrBillError);
			return;
		}

		startTransition(async () => {
			const result = await getReferenceIds(email);
			if (!result) {
				toast.error(translations.errors.qrBillError);
				return;
			}

			const { contributorReferenceId, contributionReferenceId } = result;

			setUserData({
				email,
				firstName,
				lastName,
				paymentReferenceId: contributorReferenceId,
			});
			setContributionReference(contributionReferenceId);

			setQrBillSvg(
				generateQrBillSvg({
					amount,
					contributorReferenceId,
					contributionReferenceId,
					currency: currency as 'CHF' | 'EUR',
					type: qrBillType,
				}),
			);
		});
	};

	const confirmPayment = async () => {
		if (!userData || !contributionReference) {
			toast.error(translations.errors.paymentFailed);
			return;
		}

		const payment: BankTransferPayment = {
			amount: amount,
			currency: currency as 'CHF' | 'EUR',
			referenceId: contributionReference,
		};

		startTransition(async () => {
			const pendingContribution = await createContributionForContributor(payment, userData);

			if (!pendingContribution.success) {
				toast.error(translations.errors.paymentFailed);
				return;
			}

			setPaid(true);
		});
	};

	return {
		qrBillSvg,
		isLoading,
		paid,
		generateQRCode,
		confirmPayment,
	};
}
