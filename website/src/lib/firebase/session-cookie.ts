import { resultFail, type ServiceResult } from '@/lib/service-result';
import { verifySessionCookie } from '@/modules/auth/auth.service';
import type { AuthToken } from '@/modules/auth/auth.types';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'session';

export const getCurrentAuthToken = async (): Promise<ServiceResult<AuthToken>> => {
	try {
		const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
		if (!sessionCookie) {
			return resultFail('Missing session cookie');
		}

		return verifySessionCookie(sessionCookie);
	} catch (error) {
		console.error('Could not read session cookie', { error });

		return resultFail('Could not read session cookie');
	}
};
