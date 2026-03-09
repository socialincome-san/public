import { redirect } from 'next/navigation';
import { ContributorSession } from '../services/contributor/contributor.types';
import { LocalPartnerSession } from '../services/local-partner/local-partner.types';
import { getServices } from '../services/services';
import { UserSession } from '../services/user/user.types';

export type Session = ContributorSession | LocalPartnerSession | UserSession;

const getAuthUserIdFromCookie = async (): Promise<string | null> => {
	const cookie = await getServices().firebaseSession.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const result = await getServices().firebaseSession.verifySessionCookie(cookie);
	return result.success ? result.data.uid : null;
};

export const getCurrentSessions = async (): Promise<Session[]> => {
	const authUserId = await getAuthUserIdFromCookie();
	if (!authUserId) {
		return [];
	}

	const out: Session[] = [];
	const contributorResult = await getServices().contributorRead.getCurrentContributorSession(authUserId);
	if (contributorResult.success && contributorResult.data) {
		out.push(contributorResult.data);
	}
	const userResult = await getServices().userRead.getCurrentUserSession(authUserId);
	if (userResult.success && userResult.data) {
		out.push(userResult.data);
	}
	const partnerResult = await getServices().localPartnerRead.getCurrentLocalPartnerSession(authUserId);
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
