import { ContributorService } from '@socialincome/shared/src/database/services/contributor/contributor.service';
import { FirebaseService } from '@socialincome/shared/src/database/services/firebase/firebase.service';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { cache } from 'react';
import { readSessionCookie } from './session';

export type CurrectAccountType = 'user' | 'contributor' | null;

async function detectCurrentAccountType(): Promise<CurrectAccountType> {
	const cookie = await readSessionCookie();
	if (!cookie) {
		return null;
	}

	const decodedTokenResult = await new FirebaseService().verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;

	const userService = new UserService();
	const userResult = await userService.getCurrentUserSession(authUserId);
	if (userResult.success && userResult.data) {
		return 'user';
	}

	const contributorService = new ContributorService();
	const contribResult = await contributorService.getCurrentContributorSession(authUserId);
	if (contribResult.success && contribResult.data) {
		return 'contributor';
	}

	return null;
}

export const getCurrentAccountType = cache(detectCurrentAccountType);
