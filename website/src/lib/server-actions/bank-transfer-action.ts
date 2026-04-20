'use server';

import { BankTransferPayment } from '@/lib/services/bank-transfer/bank-transfer.types';
import { BankContributorData } from '@/lib/services/contributor/contributor.types';
import { ServiceResult } from '@/lib/services/core/base.types';
import { services } from '@/lib/services/services';

export const getReferenceIds = async (
	email: string,
	firstName: string,
	lastName: string,
	language: string,
): Promise<ServiceResult<{ contributorReferenceId: string; contributionReferenceId: string }>> => {
	return await services.bankTransfer.getOrCreateQrReferences({
		email,
		firstName,
		lastName,
		language,
	});
};

export const createContributionForContributor = async (
	payment: BankTransferPayment,
	userData: BankContributorData,
): Promise<ServiceResult<unknown>> => {
	return await services.bankTransfer.createContributionForNewOrExistingContributor(payment, userData);
};
