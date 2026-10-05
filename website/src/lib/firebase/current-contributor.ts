import { getCurrentContributorSession } from '@/modules/contributors/contributor.service';
import { ContributorSession } from '@/modules/contributors/contributor.types';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getCurrentAuthToken } from './session-cookie';

const loadCurrentContributor = async (): Promise<ContributorSession | null> => {
	const decodedTokenResult = await getCurrentAuthToken();
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
