'use server';

import {
	type CreateWizardPendingContributionInput,
	type CreateWizardQrReferencesInput,
	type DownloadWizardQrBillPdfInput,
	type GetQrOnboardingPrefillInput,
	type UpdateContributorAfterQrPaymentInput,
	type UpdateContributorReferralAfterQrPaymentInput,
} from '@/lib/services/qr-bill/qr-bill.types';
import { services } from '@/lib/services/services';

export const createWizardQrReferencesAction = async (input: CreateWizardQrReferencesInput) => {
	return services.qrBill.getOrCreateQrReferences(input);
};

export const createWizardPendingContributionAction = async (input: CreateWizardPendingContributionInput) => {
	return services.qrBill.createPendingContributionFromWizard(input);
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

export const downloadWizardQrBillPdfAction = async (input: DownloadWizardQrBillPdfInput) => {
	return services.qrBill.downloadWizardQrBillPdf(input);
};
