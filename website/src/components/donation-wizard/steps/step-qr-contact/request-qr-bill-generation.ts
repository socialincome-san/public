import { createWizardQrReferencesAction } from '@/lib/server-actions/qr-wizard-actions';
import { resolveWizardQrPayment } from '@/lib/services/qr-bill/wizard-qr-payment';
import { generateQrBillSvg } from '@/lib/utils/qr-bill';
import type { DonationAmountContext } from '../../utils/donation-amount';
import type { QrDonorContext } from '../../wizard/donation-wizard-context';
import type { DonationWizardSend } from '../../wizard/types';

type RequestQrBillGenerationInput = {
	context: DonationAmountContext;
	donor: QrDonorContext;
	send: DonationWizardSend;
	currency: string;
};

export const requestQrBillGeneration = async ({ context, donor, send, currency }: RequestQrBillGenerationInput) => {
	send({
		type: 'QR_CONTACT_SUBMIT',
		donor: {
			firstName: donor.firstName,
			lastName: donor.lastName,
			email: donor.email,
		},
		language: donor.language,
	});

	const paymentResult = resolveWizardQrPayment(context, currency);
	if (!paymentResult.success) {
		send({ type: 'QR_BILL_ERROR', message: paymentResult.error });

		return;
	}

	const referencesResult = await createWizardQrReferencesAction({
		email: donor.email,
		firstName: donor.firstName,
		lastName: donor.lastName,
		language: donor.language,
	});

	if (!referencesResult.success) {
		send({ type: 'QR_BILL_ERROR', message: referencesResult.error });

		return;
	}

	try {
		const qrBillSvg = generateQrBillSvg({
			amount: paymentResult.data.amount,
			contributorReferenceId: referencesResult.data.contributorReferenceId,
			contributionReferenceId: referencesResult.data.contributionReferenceId,
			currency: paymentResult.data.currency as 'CHF' | 'EUR',
			type: 'QRCODE',
		});

		send({
			type: 'QR_BILL_READY',
			contributorReferenceId: referencesResult.data.contributorReferenceId,
			contributionReferenceId: referencesResult.data.contributionReferenceId,
			qrBillSvg,
		});
	} catch {
		send({ type: 'QR_BILL_ERROR', message: 'QR bill generation failed' });
	}
};
