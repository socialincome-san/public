import { authAdmin } from '@/lib/firebase/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export class FirebaseSessionService extends BaseService {
	private static readonly sessionCookieName = 'session';
	private static readonly sessionMaxAgeDays = 7;
	private static readonly sessionExpiresInMs = FirebaseSessionService.sessionMaxAgeDays * 24 * 60 * 60 * 1000;
	private static readonly isProd = process.env.NODE_ENV === 'production';

	private async createSessionCookie(idToken: string): Promise<ServiceResult<string>> {
		try {
			const cookie = await authAdmin.auth.createSessionCookie(idToken, {
				expiresIn: FirebaseSessionService.sessionExpiresInMs,
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
			name: FirebaseSessionService.sessionCookieName,
			value,
			httpOnly: true,
			secure: FirebaseSessionService.isProd,
			sameSite: 'lax',
			path: '/',
			maxAge: Math.floor(FirebaseSessionService.sessionExpiresInMs / 1000),
		});
	}

	async createSessionAndSetCookie(idToken: string): Promise<ServiceResult<boolean>> {
		if (!idToken) {
			return this.resultFail('missing-id-token');
		}
		try {
			const result = await this.createSessionCookie(idToken);
			if (!result.success) {
				return result;
			}

			await this.setSessionCookie(result.data);

			return this.resultOk(true);
		} catch (error) {
			return this.resultFail(`Could not create session cookie: ${JSON.stringify(error)}`);
		}
	}

	async clearSessionCookie(): Promise<ServiceResult<boolean>> {
		try {
			const store = await cookies();
			store.set({
				name: FirebaseSessionService.sessionCookieName,
				value: '',
				httpOnly: true,
				secure: FirebaseSessionService.isProd,
				sameSite: 'lax',
				path: '/',
				maxAge: 0,
			});

			return this.resultOk(true);
		} catch {
			return this.resultFail('logout-failed');
		}
	}

	async readSessionCookie(): Promise<ServiceResult<string | null>> {
		try {
			const store = await cookies();

			return this.resultOk(store.get(FirebaseSessionService.sessionCookieName)?.value ?? null);
		} catch (error) {
			return this.resultFail(`Could not read session cookie: ${JSON.stringify(error)}`);
		}
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

		const match = /session=([^;]+)/.exec(cookieHeader);
		if (!match) {
			return this.resultFail('Missing session cookie');
		}

		const cookie = match[1];

		return this.verifySessionCookie(cookie);
	}
}
