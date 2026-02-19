import { ContributorService } from '../services/contributor/contributor.service';
import { ContributorSession } from '../services/contributor/contributor.types';
import { FirebaseSessionService } from '../services/firebase/firebase-session.service';
import { LocalPartnerService } from '../services/local-partner/local-partner.service';
import { LocalPartnerSession } from '../services/local-partner/local-partner.types';
import { UserService } from '../services/user/user.service';
import { UserSession } from '../services/user/user.types';
import { redirect } from 'next/navigation';

export type Session = ContributorSession | LocalPartnerSession | UserSession;

export type Actor =
	| { kind: 'user'; session: UserSession }
	| { kind: 'contributor'; session: ContributorSession }
	| { kind: 'local-partner'; session: LocalPartnerSession }
	| never;

async function getAuthUserIdFromCookie(): Promise<string | null> {
	const firebaseSessionService = new FirebaseSessionService();
	const cookie = await firebaseSessionService.readSessionCookie();
	if (!cookie)
	{
		return null;
	}
	const result = await firebaseSessionService.verifySessionCookie(cookie);
	return result.success ? result.data.uid : null;
}

export async function getCurrentSessions(): Promise<Session[]> {
	const authUserId = await getAuthUserIdFromCookie();
	if (!authUserId)
	{
		return [];
	}

	const contributorService = new ContributorService();
	const userService = new UserService();
	const localPartnerService = new LocalPartnerService();

	const out: Session[] = [];
	const contributorResult = await contributorService.getCurrentContributorSession(authUserId);
	if (contributorResult.success && contributorResult.data)
	{
		out.push(contributorResult.data);
	}
	const userResult = await userService.getCurrentUserSession(authUserId);
	if (userResult.success && userResult.data)
	{
		out.push(userResult.data);
	}
	const partnerResult = await localPartnerService.getCurrentLocalPartnerSession(authUserId);
	if (partnerResult.success && partnerResult.data)
	{
		out.push(partnerResult.data);
	}
	return out;
}

export async function getCurrentSessionsOrRedirect(): Promise<Session[]> {
	const sessions = await getCurrentSessions();
	if (sessions.length === 0)
	{
		redirect('/login');
	}
	return sessions;
}

export async function getActorOrThrow(): Promise<Actor> {
	const sessions = await getCurrentSessions();
	const session = sessions[0];
	if (!session)
	{
		throw new Error('Not authenticated');
	}
	if (session.type === 'user')
	{
		return { kind: 'user', session };
	}
	if (session.type === 'contributor')
	{
		return { kind: 'contributor', session };
	}
	if (session.type === 'local-partner')
	{
		return { kind: 'local-partner', session };
	}
	throw new Error('Not authenticated');
}
