import { getCurrentContributorSession } from '@/modules/contributors/contributor.service';
import type { ContributorSession } from '@/modules/contributors/contributor.types';
import { getCurrentLocalPartnerSession } from '@/modules/local-partners/local-partner.service';
import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import { getCurrentUserSession } from '@/modules/users/user.service';
import type { UserSession } from '@/modules/users/user.types';
import { redirect } from 'next/navigation';
import { resultFail, resultOk, type ServiceResult } from '../service-result';
import { getCurrentAuthToken } from './session-cookie';

export type Session = ContributorSession | LocalPartnerSession | UserSession;

const getAuthUserIdFromCookie = async (): Promise<string | null> => {
	const result = await getCurrentAuthToken();

	return result.success ? result.data.uid : null;
};

export const getCurrentSessions = async (): Promise<Session[]> => {
	const authUserId = await getAuthUserIdFromCookie();
	if (!authUserId) {
		return [];
	}

	const out: Session[] = [];
	const contributorResult = await getCurrentContributorSession(authUserId);
	if (contributorResult.success && contributorResult.data) {
		out.push(contributorResult.data);
	}
	const userResult = await getCurrentUserSession(authUserId);
	if (userResult.success && userResult.data) {
		out.push(userResult.data);
	}
	const partnerResult = await getCurrentLocalPartnerSession(authUserId);
	if (partnerResult.success && partnerResult.data) {
		out.push(partnerResult.data);
	}

	return out;
};

export const getSessionsOrRedirect = async (): Promise<Session[]> => {
	const sessions = await getCurrentSessions();
	if (sessions.length === 0) {
		redirect('/login');
	}

	return sessions;
};

type SessionByType<T extends Session['type']> = Extract<Session, { type: T }>;

export const getSessionByType = async <T extends Session['type']>(type: T): Promise<ServiceResult<SessionByType<T>>> => {
	try {
		const sessions = await getCurrentSessions();
		if (sessions.length === 0) {
			return resultFail('Not authenticated');
		}

		const session = sessions.find((s): s is SessionByType<T> => s.type === type);
		if (!session) {
			return resultFail(`No ${type} session`);
		}

		return resultOk(session);
	} catch (error) {
		console.error('Could not resolve session', { type, error });

		return resultFail('Could not resolve session');
	}
};
