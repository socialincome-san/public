'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ContributorService } from '@socialincome/shared/src/database/services/contributor/contributor.service';
import { DonationCertificateService } from '@socialincome/shared/src/database/services/donation-certificate/donation-certificate.service';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { revalidatePath } from 'next/cache';

export async function getContributorOptions() {
	await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorService();

	return await contributorService.getByIds();
}

export async function generateDonationCertificates(year: number, contributorIds: string[], language?: LanguageCode) {
	await getAuthenticatedUserOrThrow();
	const donationCertificateService = new DonationCertificateService();

	const result = await donationCertificateService.createDonationCertificates(year, contributorIds, language);
	revalidatePath('/portal/management/donation-certificates');
	return result;
}
