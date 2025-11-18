import { ContributorService } from '@socialincome/shared/src/database/services/contributor/contributor.service';
import { ContributorSession } from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { FirebaseService } from '@socialincome/shared/src/database/services/firebase/firebase.service';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { readSessionCookie } from './session';

async function findContributorByAuthId(authUserId: string): Promise<ContributorSession | null> {
	const service = new ContributorService();
	const result = await service.getCurrentContributorSession(authUserId);
	return result.success ? result.data : null;
}

async function loadCurrentContributor(): Promise<ContributorSession | null> {
	const cookie = await readSessionCookie();
	if (!cookie) {
		return null;
	}
	const decodedTokenResult = await new FirebaseService().verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	return findContributorByAuthId(authUserId);
}

const getCurrentContributor = cache(loadCurrentContributor);

export async function getAuthenticatedContributorOrRedirect(): Promise<ContributorSession> {
	const contributor = await getCurrentContributor();
	if (!contributor) {
		redirect('/login');
	}
	return contributor;
}
