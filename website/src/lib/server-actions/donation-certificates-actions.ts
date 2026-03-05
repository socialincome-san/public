'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ContributorReadService } from '@/lib/services/contributor/contributor-read.service';
import { DonationCertificateWriteService } from '@/lib/services/donation-certificate/donation-certificate-write.service';
import { LanguageCode } from '@/lib/types/language';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedContributorOrRedirect } from '../firebase/current-contributor';

export const getContributorOptions = async () => {
	await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorReadService();

	return await contributorService.getByIds();
};

export const generateDonationCertificates = async (year: number, contributorIds: string[], language?: LanguageCode) => {
	await getAuthenticatedUserOrThrow();
	const donationCertificateService = new DonationCertificateWriteService();

	const result = await donationCertificateService.createDonationCertificates(year, contributorIds, language);
	revalidatePath('/portal/management/donation-certificates');
	return result;
};

export const generateDonationCertificateForCurrentUser = async (year: number, language?: LanguageCode) => {
	const contributorSession = await getAuthenticatedContributorOrRedirect();
	const donationCertificateService = new DonationCertificateWriteService();

	const result = await donationCertificateService.createDonationCertificate(year, contributorSession.id, language);
	revalidatePath('/dashboard/donation-certificates');
	return result;
};
