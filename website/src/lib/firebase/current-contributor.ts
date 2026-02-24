import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { services } from '@/lib/services/services';
import { redirect } from 'next/navigation';
import { cache } from 'react';

const findContributorByAuthId = async (authUserId: string): Promise<ContributorSession | null> => {
	const result = await services.contributor.getCurrentContributorSession(authUserId);
	return result.success ? result.data : null;
};

const loadCurrentContributor = async (): Promise<ContributorSession | null> => {
	const cookie = await services.firebaseSession.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const decodedTokenResult = await services.firebaseSession.verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	return findContributorByAuthId(authUserId);
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

export const getAuthenticatedContributorOrThrow = async (): Promise<ContributorSession> => {
	const contributor = await getCurrentContributor();
	if (!contributor) {
		throw new Error('No authenticated contributor found');
	}
	return contributor;
};
