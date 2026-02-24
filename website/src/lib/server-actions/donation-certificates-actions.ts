'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { LanguageCode } from '@/lib/types/language';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedContributorOrRedirect } from '../firebase/current-contributor';

export const getContributorOptions = async () => {
	await getAuthenticatedUserOrThrow();

	return await services.contributor.getByIds();
};

export const generateDonationCertificates = async (year: number, contributorIds: string[], language?: LanguageCode) => {
	await getAuthenticatedUserOrThrow();

	const result = await services.donationCertificate.createDonationCertificates(year, contributorIds, language);
	revalidatePath('/portal/management/donation-certificates');
	return result;
};

export const generateDonationCertificateForCurrentUser = async (year: number, language?: LanguageCode) => {
	const contributorSession = await getAuthenticatedContributorOrRedirect();

	const result = await services.donationCertificate.createDonationCertificate(year, contributorSession.id, language);
	revalidatePath('/dashboard/donation-certificates');
	return result;
};
