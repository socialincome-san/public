import { createWizardQrBillAction } from '@/modules/qr-bills/qr-bill.actions';
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

	const result = await createWizardQrBillAction({
		wizardContext: context,
		donor: {
			email: donor.email,
			firstName: donor.firstName,
			lastName: donor.lastName,
			language: donor.language,
		},
		currency,
	});

	if (!result.success) {
		send({ type: 'QR_BILL_ERROR', message: result.error });

		return;
	}

	send({
		type: 'QR_BILL_READY',
		contributorReferenceId: result.data.contributorReferenceId,
		contributionReferenceId: result.data.contributionReferenceId,
		display: result.data.display,
	});
};
