'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { LanguageCode } from '@/lib/types/language';
import { getServices } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedContributorOrRedirect } from '../firebase/current-contributor';

export const getContributorOptions = async () => {
	await getAuthenticatedUserOrThrow();
	return await getServices().contributorRead.getByIds();
};

export const generateDonationCertificates = async (year: number, contributorIds: string[], language?: LanguageCode) => {
	await getAuthenticatedUserOrThrow();
	const result = await getServices().donationCertificateWrite.createDonationCertificates(year, contributorIds, language);
	revalidatePath('/portal/management/donation-certificates');
	return result;
};

export const generateDonationCertificateForCurrentUser = async (year: number, language?: LanguageCode) => {
	const contributorSession = await getAuthenticatedContributorOrRedirect();
	const result = await getServices().donationCertificateWrite.createDonationCertificate(year, contributorSession.id, language);
	revalidatePath('/dashboard/donation-certificates');
	return result;
};
