import { ContributorService } from '@socialincome/shared/src/database/services/contributor/contributor.service';
import { FirebaseService } from '@socialincome/shared/src/database/services/firebase/firebase.service';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { cache } from 'react';
import { readSessionCookie } from './session';

export type CurrentAccountType = 'user' | 'contributor' | null;

async function detectCurrentAccountType(): Promise<CurrentAccountType> {
	const cookie = await readSessionCookie();
	if (!cookie) {
		return null;
	}

	const decodedTokenResult = await new FirebaseService().verifySessionCookie(cookie);
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
