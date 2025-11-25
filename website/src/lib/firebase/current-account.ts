import { cache } from 'react';
import { ContributorService } from '../services/contributor/contributor.service';
import { FirebaseService } from '../services/firebase/firebase.service';
import { UserService } from '../services/user/user.service';

export type CurrentAccountType = 'user' | 'contributor' | null;

const firebaseService = new FirebaseService();

async function detectCurrentAccountType(): Promise<CurrentAccountType> {
	const cookie = await firebaseService.readSessionCookie();
	if (!cookie) {
		return null;
	}

	const decodedTokenResult = await firebaseService.verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;

	const contributorService = new ContributorService();
	const contributorResult = await contributorService.getCurrentContributorSession(authUserId);
	if (contributorResult.success && contributorResult.data) {
		return 'contributor';
	}

	const userService = new UserService();
	const userResult = await userService.getCurrentUserSession(authUserId);
	if (userResult.success && userResult.data) {
		return 'user';
	}

	return null;
}

export const getCurrentAccountType = cache(detectCurrentAccountType);
