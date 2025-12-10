import { ContributorService } from '@/lib/services/contributor/contributor.service';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { FirebaseService } from '@/lib/services/firebase/firebase.service';
import { redirect } from 'next/navigation';
import { cache } from 'react';

const firebaseService = new FirebaseService();

async function findContributorByAuthId(authUserId: string): Promise<ContributorSession | null> {
	const service = new ContributorService();
	const result = await service.getCurrentContributorSession(authUserId);
	return result.success ? result.data : null;
}

async function loadCurrentContributor(): Promise<ContributorSession | null> {
	const cookie = await firebaseService.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const decodedTokenResult = await firebaseService.verifySessionCookie(cookie);
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

export async function getOptionalContributor(): Promise<ContributorSession | null> {
	return await getCurrentContributor();
}

export async function getAuthenticatedContributorOrThrow(): Promise<ContributorSession> {
	const contributor = await getCurrentContributor();
	if (!contributor) {
		throw new Error('No authenticated contributor found');
	}
	return contributor;
}
