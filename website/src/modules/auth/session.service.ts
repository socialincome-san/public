import { resultFail, resultOk, type Result } from '@/lib/result';
import { getCurrentContributorSession } from '@/modules/contributors/contributor.service';
import type { ContributorSession } from '@/modules/contributors/contributor.types';
import { getCurrentLocalPartnerSession } from '@/modules/local-partners/local-partner.service';
import { getSurveyByAccessEmail } from '@/modules/surveys/survey.service';
import type { SurveyPayload } from '@/modules/surveys/survey.types';
import { getCurrentUserSession } from '@/modules/users/user.service';
import type { UserSession } from '@/modules/users/user.types';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { verifySessionCookie } from './auth.service';
import { SESSION_COOKIE_NAME, type AuthToken, type Session } from './auth.types';

// `cookies()` stays outside try/catch: during the build it throws to mark the route as dynamic.
export const getCurrentAuthToken = async (): Promise<Result<AuthToken>> => {
	const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
	if (!sessionCookie) {
		return resultFail('Missing session cookie');
	}

	return verifySessionCookie(sessionCookie);
};

export const getCurrentSessions = async (): Promise<Result<Session[]>> => {
	const tokenResult = await loadAuthToken();
	if (!tokenResult.success) {
		return resultOk([]);
	}

	try {
		return resultOk(await loadSessionsForAuthUser(tokenResult.data.uid));
	} catch (error) {
		console.error('Could not resolve sessions', { error });

		return resultFail('Could not resolve session');
	}
};

export const getSessionByType = async <T extends Session['type']>(type: T): Promise<Result<SessionByType<T>>> => {
	const sessionsResult = await getCurrentSessions();
	if (!sessionsResult.success) {
		return resultFail(sessionsResult.error, sessionsResult.status);
	}
	if (sessionsResult.data.length === 0) {
		return resultFail('Not authenticated');
	}

	const session = sessionsResult.data.find((entry): entry is SessionByType<T> => entry.type === type);
	if (!session) {
		return resultFail(missingSessionMessage[type]);
	}

	return resultOk(session);
};

export const getCurrentUser = async (): Promise<Result<UserSession | null>> => resultOk(await loadCurrentUser());

export const getOptionalContributor = async (): Promise<Result<ContributorSession | null>> =>
	resultOk(await loadCurrentContributor());

export const getCurrentSurvey = async (): Promise<Result<SurveyPayload | null>> => resultOk(await loadCurrentSurvey());

type SessionByType<T extends Session['type']> = Extract<Session, { type: T }>;

const missingSessionMessage = {
	user: 'No user session',
	contributor: 'No contributor session',
	'local-partner': 'No local-partner session',
} as const satisfies Record<Session['type'], string>;

const loadAuthToken = cache(getCurrentAuthToken);

const loadCurrentUser = cache(async (): Promise<UserSession | null> => {
	const tokenResult = await loadAuthToken();
	if (!tokenResult.success) {
		return null;
	}

	const result = await getCurrentUserSession(tokenResult.data.uid);

	return result.success ? result.data : null;
});

const loadCurrentContributor = cache(async (): Promise<ContributorSession | null> => {
	const tokenResult = await loadAuthToken();
	if (!tokenResult.success) {
		return null;
	}

	const result = await getCurrentContributorSession(tokenResult.data.uid);

	return result.success ? result.data : null;
});

const loadCurrentSurvey = cache(async (): Promise<SurveyPayload | null> => {
	const tokenResult = await loadAuthToken();
	if (!tokenResult.success || !tokenResult.data.email) {
		return null;
	}

	const result = await getSurveyByAccessEmail(tokenResult.data.email);

	return result.success ? result.data : null;
});

const loadSessionsForAuthUser = async (authUserId: string): Promise<Session[]> => {
	const [contributorResult, userResult, partnerResult] = await Promise.all([
		getCurrentContributorSession(authUserId),
		getCurrentUserSession(authUserId),
		getCurrentLocalPartnerSession(authUserId),
	]);
	const sessions: Session[] = [];
	if (contributorResult.success) {
		sessions.push(contributorResult.data);
	}
	if (userResult.success) {
		sessions.push(userResult.data);
	}
	if (partnerResult.success) {
		sessions.push(partnerResult.data);
	}

	return sessions;
};
