'use server';

import { BankTransferService } from '@/lib/services/bank-transfer/bank-transfer.service';
import { BankTransferPayment } from '@/lib/services/bank-transfer/bank-transfer.types';
import { ContributorService } from '@/lib/services/contributor/contributor.service';
import { BankContributorData } from '@/lib/services/contributor/contributor.types';
import { DateTime } from 'luxon';

export async function getReferenceIds(
	email: string,
): Promise<{ contributorReferenceId: string; contributionReferenceId: string } | undefined> {
	const contributorService = new ContributorService();
	const contributorReferenceId = await contributorService.getOrCreateReferenceIdByEmail(email);
	if (!contributorReferenceId.success) {
		return;
	}
	const contributionReferenceId = Math.round(DateTime.now().toMillis() / 1000).toString();
	return { contributorReferenceId: contributorReferenceId.data, contributionReferenceId };
}

export async function createContributionForContributor(payment: BankTransferPayment, userData: BankContributorData) {
	const bankTransferService = new BankTransferService();
	return await bankTransferService.createContributionForNewOrExistingContributor(payment, userData);
}
