import { redirect } from 'next/navigation';
import { ContributorService } from '../services/contributor/contributor.service';
import { ContributorSession } from '../services/contributor/contributor.types';
import { FirebaseSessionService } from '../services/firebase/firebase-session.service';
import { LocalPartnerService } from '../services/local-partner/local-partner.service';
import { LocalPartnerSession } from '../services/local-partner/local-partner.types';
import { UserService } from '../services/user/user.service';
import { UserSession } from '../services/user/user.types';

export type Session = ContributorSession | LocalPartnerSession | UserSession;

const getAuthUserIdFromCookie = async (): Promise<string | null> => {
	const firebaseSessionService = new FirebaseSessionService();
	const cookie = await firebaseSessionService.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const result = await firebaseSessionService.verifySessionCookie(cookie);
	return result.success ? result.data.uid : null;
};

export const getCurrentSessions = async (): Promise<Session[]> => {
	const authUserId = await getAuthUserIdFromCookie();
	if (!authUserId) {
		return [];
	}

	const contributorService = new ContributorService();
	const userService = new UserService();
	const localPartnerService = new LocalPartnerService();

	const out: Session[] = [];
	const contributorResult = await contributorService.getCurrentContributorSession(authUserId);
	if (contributorResult.success && contributorResult.data) {
		out.push(contributorResult.data);
	}
	const userResult = await userService.getCurrentUserSession(authUserId);
	if (userResult.success && userResult.data) {
		out.push(userResult.data);
	}
	const partnerResult = await localPartnerService.getCurrentLocalPartnerSession(authUserId);
	if (partnerResult.success && partnerResult.data) {
		out.push(partnerResult.data);
	}
	return out;
};

export const getCurrentSessionsOrRedirect = async (): Promise<Session[]> => {
	const sessions = await getCurrentSessions();
	if (sessions.length === 0) {
		redirect('/login');
	}
	return sessions;
};

export const getSessionByTypeOrThrow = async (type: Session['type']): Promise<Session> => {
	const sessions = await getCurrentSessions();
	if (sessions.length === 0) {
		throw new Error('Not authenticated');
	}
	const session = sessions.find((s) => s.type === type);
	if (!session) {
		throw new Error(`No ${type} session`);
	}
	return session;
};
