'use server';

import { type BankContributorData } from '@/lib/services/contributor/contributor.types';
import { type ServiceResult } from '@/lib/services/core/base.types';
import { type LegacyQrBillPayment } from '@/lib/services/qr-bill/legacy/legacy-qr-bill.types';
import { services } from '@/lib/services/services';

export const getReferenceIds = async (
	email: string,
	firstName: string,
	lastName: string,
	language: string,
): Promise<ServiceResult<{ contributorReferenceId: string; contributionReferenceId: string }>> => {
	return await services.qrBillLegacy.getOrCreateQrReferences({
		email,
		firstName,
		lastName,
		language,
	});
};

export const createContributionForContributor = async (
	payment: LegacyQrBillPayment,
	userData: BankContributorData,
): Promise<ServiceResult<unknown>> => {
	return await services.qrBillLegacy.createContributionForNewOrExistingContributor(payment, userData);
};
