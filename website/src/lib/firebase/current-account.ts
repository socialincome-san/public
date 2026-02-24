import { redirect } from 'next/navigation';
import { ContributorSession } from '../services/contributor/contributor.types';
import { LocalPartnerSession } from '../services/local-partner/local-partner.types';
import { services } from '../services/services';
import { UserSession } from '../services/user/user.types';

export type Session = ContributorSession | LocalPartnerSession | UserSession;

export type Actor =
	| { kind: 'user'; session: UserSession }
	| { kind: 'contributor'; session: ContributorSession }
	| { kind: 'local-partner'; session: LocalPartnerSession }
	| never;

const getAuthUserIdFromCookie = async (): Promise<string | null> => {
	const cookie = await services.firebaseSession.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const result = await services.firebaseSession.verifySessionCookie(cookie);
	return result.success ? result.data.uid : null;
};

export const getCurrentSessions = async (): Promise<Session[]> => {
	const authUserId = await getAuthUserIdFromCookie();
	if (!authUserId) {
		return [];
	}

	const out: Session[] = [];
	const contributorResult = await services.contributor.getCurrentContributorSession(authUserId);
	if (contributorResult.success && contributorResult.data) {
		out.push(contributorResult.data);
	}
	const userResult = await services.user.getCurrentUserSession(authUserId);
	if (userResult.success && userResult.data) {
		out.push(userResult.data);
	}
	const partnerResult = await services.localPartner.getCurrentLocalPartnerSession(authUserId);
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

export const getActorOrThrow = async (): Promise<Actor> => {
	const sessions = await getCurrentSessions();
	const session = sessions[0];
	if (!session) {
		throw new Error('Not authenticated');
	}
	if (session.type === 'user') {
		return { kind: 'user', session };
	}
	if (session.type === 'contributor') {
		return { kind: 'contributor', session };
	}
	if (session.type === 'local-partner') {
		return { kind: 'local-partner', session };
	}
	throw new Error('Not authenticated');
};
