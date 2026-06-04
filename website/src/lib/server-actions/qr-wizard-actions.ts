'use server';

import { type DonationAmountContext } from '@/components/donation-wizard/utils/donation-amount';
import { type BankContributorData } from '@/lib/services/contributor/contributor.types';
import {
	type CreateWizardQrReferencesInput,
	type GetQrOnboardingPrefillInput,
	type UpdateContributorAfterQrPaymentInput,
	type UpdateContributorReferralAfterQrPaymentInput,
	type WizardQrPayment,
} from '@/lib/services/qr-bill/qr-bill.types';
import { resolveWizardQrPayment } from '@/lib/services/qr-bill/wizard-qr-payment';
import { services } from '@/lib/services/services';

export const createWizardQrReferencesAction = async (input: CreateWizardQrReferencesInput) => {
	return services.qrBill.getOrCreateQrReferences(input);
};

export const createWizardPendingContributionAction = async (input: {
	wizardContext: DonationAmountContext;
	contributionReferenceId: string;
	userData: BankContributorData;
	currency?: string;
}) => {
	const paymentResult = resolveWizardQrPayment(input.wizardContext, input.currency);
	if (!paymentResult.success) {
		return paymentResult;
	}

	const payment: WizardQrPayment = {
		...paymentResult.data,
		referenceId: input.contributionReferenceId,
	};

	return services.qrBill.createPendingContribution(payment, input.userData);
};

export const getQrOnboardingPrefillAction = async (input: GetQrOnboardingPrefillInput) => {
	return services.qrBill.getOnboardingPrefill(input);
};

export const updateContributorAfterWizardQrAction = async (input: UpdateContributorAfterQrPaymentInput) => {
	return services.qrBill.updateContributorAfterQrPayment(input);
};

export const updateContributorReferralAfterWizardQrAction = async (input: UpdateContributorReferralAfterQrPaymentInput) => {
	return services.qrBill.updateReferralAfterQrPayment(input);
};
