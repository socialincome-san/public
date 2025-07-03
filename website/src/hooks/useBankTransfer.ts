import { SubmitBankTransferRequest } from '@/app/api/bank-transfer/submit/route';
import { generateQrBillSvg } from '@/utils/qr-bill';
import { useState } from 'react';
import toast from 'react-hot-toast';

type UserFormData = {
	email: string;
	firstName: string;
	lastName: string;
	paymentReferenceId: number;
};

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
	const [userData, setUserData] = useState<UserFormData | null>(null);
	const [qrBillSvg, setQrBillSvg] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [paid, setPaid] = useState(false);

	const generateQRCode = async (email: string, firstName: string, lastName: string) => {
		setIsLoading(true);

		if (!currency) {
			toast.error(translations.errors.qrBillError);
		}

		const response = await fetch(`/api/bank-transfer/payment-reference/create`, {
			method: 'POST',
			body: JSON.stringify({ email }),
		});

		if (!response.ok) {
			toast.error(translations.errors.qrBillError);
			return;
		}

		const { paymentReferenceId } = await response.json();

		setUserData({
			email,
			firstName,
			lastName,
			paymentReferenceId,
		});

		setQrBillSvg(
			generateQrBillSvg({
				amount,
				paymentIntervalMonths: intervalCount,
				paymentReferenceId,
				currency: currency as 'CHF' | 'EUR',
				type: qrBillType,
			}),
		);

		setIsLoading(false);
	};

	const confirmPayment = async () => {
		setIsLoading(true);

		if (!userData) {
			toast.error(translations.errors.paymentFailed);
		}

		const response = await fetch('/api/bank-transfer/submit', {
			method: 'POST',
			body: JSON.stringify({
				user: userData,
				payment: {
					amount: amount,
					intervalCount: intervalCount,
					currency: currency,
					recurring: true,
				},
			} as SubmitBankTransferRequest),
		});

		if (!response.ok) {
			toast.error(translations.errors.paymentFailed);
			return;
		}

		setIsLoading(false);
		setPaid(true);
	};

	return {
		qrBillSvg,
		isLoading,
		paid,
		generateQRCode,
		confirmPayment,
	};
}
