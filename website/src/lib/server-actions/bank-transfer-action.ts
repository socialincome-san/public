'use server';

import { BankTransferPayment } from '@/lib/services/bank-transfer/bank-transfer.types';
import { BankContributorData } from '@/lib/services/contributor/contributor.types';
import { ServiceResult } from '@/lib/services/core/base.types';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';
import { DateTime } from 'luxon';

export const getReferenceIds = async (
	email: string,
): Promise<ServiceResult<{ contributorReferenceId: string; contributionReferenceId: string }>> => {
	const contributorReferenceId = await services.write.contributor.getOrCreateReferenceIdByEmail(email);
	if (!contributorReferenceId.success) {
		return resultFail(contributorReferenceId.error);
	}
	const contributionReferenceId = Math.round(DateTime.now().toMillis() / 1000).toString();

	return resultOk({ contributorReferenceId: contributorReferenceId.data, contributionReferenceId });
};

export const createContributionForContributor = async (
	payment: BankTransferPayment,
	userData: BankContributorData,
): Promise<ServiceResult<unknown>> => {
	return await services.bankTransfer.createContributionForNewOrExistingContributor(payment, userData);
};
