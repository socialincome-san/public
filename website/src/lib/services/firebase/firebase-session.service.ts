import { authAdmin } from '@/lib/firebase/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { PrismaClient } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

const SESSION_COOKIE_NAME = 'session';
const SESSION_MAX_AGE_DAYS = 7;
const SESSION_EXPIRES_IN_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
const IS_PROD = process.env.NODE_ENV === 'production';

export class FirebaseSessionService extends BaseService {
	constructor(db: PrismaClient) { super(db); }

	private async createSessionCookie(idToken: string): Promise<ServiceResult<string>> {
		try {
			const cookie = await authAdmin.auth.createSessionCookie(idToken, {
				expiresIn: SESSION_EXPIRES_IN_MS,
			});

			const verified = await this.verifySessionCookie(cookie);
			if (!verified.success) {
				return this.resultFail('invalid-token');
			}

			return this.resultOk(cookie);
		} catch {
			return this.resultFail('invalid-token');
		}
	}

	private async setSessionCookie(value: string): Promise<void> {
		const store = await cookies();
		store.set({
			name: SESSION_COOKIE_NAME,
			value,
			httpOnly: true,
			secure: IS_PROD,
			sameSite: 'lax',
			path: '/',
			maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1000),
		});
	}

	async createSessionAndSetCookie(idToken: string): Promise<ServiceResult<boolean>> {
		if (!idToken) {
			return this.resultFail('missing-id-token');
		}

		const result = await this.createSessionCookie(idToken);
		if (!result.success) {
			return result;
		}

		await this.setSessionCookie(result.data);
		return this.resultOk(true);
	}

	async clearSessionCookie(): Promise<ServiceResult<boolean>> {
		try {
			const store = await cookies();
			store.set({
				name: SESSION_COOKIE_NAME,
				value: '',
				httpOnly: true,
				secure: IS_PROD,
				sameSite: 'lax',
				path: '/',
				maxAge: 0,
			});
			return this.resultOk(true);
		} catch {
			return this.resultFail('logout-failed');
		}
	}

	async readSessionCookie(): Promise<string | null> {
		const store = await cookies();
		return store.get(SESSION_COOKIE_NAME)?.value ?? null;
	}

	async verifySessionCookie(cookie: string): Promise<ServiceResult<DecodedIdToken>> {
		try {
			const decoded = await authAdmin.auth.verifySessionCookie(cookie, true);
			return this.resultOk(decoded);
		} catch (error) {
			return this.resultFail(`Invalid or expired session cookie: ${JSON.stringify(error)}`);
		}
	}

	async getDecodedSessionFromRequest(request: Request): Promise<ServiceResult<DecodedIdToken>> {
		const cookieHeader = request.headers.get('cookie');
		if (!cookieHeader) {
			return this.resultFail('Missing session cookie');
		}

		const match = cookieHeader.match(/session=([^;]+)/);
		if (!match) {
			return this.resultFail('Missing session cookie');
		}

		const cookie = match[1];
		return this.verifySessionCookie(cookie);
	}
}
