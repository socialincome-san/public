import { services } from '@/lib/services/services';
import { getCurrentContributorSession } from '@/modules/contributors/contributor.service';
import { ContributorSession } from '@/modules/contributors/contributor.types';
import { redirect } from 'next/navigation';
import { cache } from 'react';

const loadCurrentContributor = async (): Promise<ContributorSession | null> => {
	const cookieResult = await services.firebaseSession.readSessionCookie();
	if (!cookieResult.success || !cookieResult.data) {
		return null;
	}
	const decodedTokenResult = await services.firebaseSession.verifySessionCookie(cookieResult.data);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	const result = await getCurrentContributorSession(authUserId);

	return result.success ? result.data : null;
};

const getCurrentContributor = cache(loadCurrentContributor);

export const getAuthenticatedContributorOrRedirect = async (): Promise<ContributorSession> => {
	const contributor = await getCurrentContributor();
	if (!contributor) {
		redirect('/login');
	}

	return contributor;
};

export const getOptionalContributor = async (): Promise<ContributorSession | null> => {
	return await getCurrentContributor();
};
