'use server';

import { ROUTES } from '@/lib/constants/routes';
import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import { LanguageCode } from '@/lib/types/language';
import { revalidatePath } from 'next/cache';

export const getContributorOptions = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return await services.read.contributor.getByIds();
};

export const generateDonationCertificates = async (year: number, contributorIds: string[], language?: LanguageCode) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.donationCertificate.createDonationCertificates(year, contributorIds, language);
	revalidatePath(ROUTES.portalManagementDonationCertificates);
	return result;
};

export const generateDonationCertificateForCurrentUser = async (year: number, language?: LanguageCode) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const contributorSession = sessionResult.data;
	const result = await services.write.donationCertificate.createDonationCertificate(
		year,
		contributorSession.id,
		language,
	);
	revalidatePath(ROUTES.dashboardDonationCertificates);
	return result;
};
