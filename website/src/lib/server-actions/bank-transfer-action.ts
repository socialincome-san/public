'use server';

import { BankTransferPayment } from '@/lib/services/bank-transfer/bank-transfer.types';
import { BankContributorData } from '@/lib/services/contributor/contributor.types';
import { services } from '@/lib/services/services';
import { DateTime } from 'luxon';

export const getReferenceIds = async (
	email: string,
): Promise<{ contributorReferenceId: string; contributionReferenceId: string } | undefined> => {
	const contributorReferenceId = await services.contributor.getOrCreateReferenceIdByEmail(email);
	if (!contributorReferenceId.success) {
		return;
	}
	const contributionReferenceId = Math.round(DateTime.now().toMillis() / 1000).toString();
	return { contributorReferenceId: contributorReferenceId.data, contributionReferenceId };
};

export const createContributionForContributor = async (payment: BankTransferPayment, userData: BankContributorData) => {
	return await services.bankTransfer.createContributionForNewOrExistingContributor(payment, userData);
};
