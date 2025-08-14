import { authAdmin } from '@/lib/firebase/firebase-admin';
import { SESSION_EXPIRES_IN_MS, setSessionCookie } from '@/lib/firebase/session';
import { NextResponse } from 'next/server';

type Body = { idToken?: string };

export async function POST(req: Request) {
	try {
		const { idToken } = await parseJsonBody(req);
		if (!idToken) {
			return NextResponse.json({ ok: false, error: 'missing-id-token' }, { status: 400 });
		}

		const sessionCookie = await createAndVerifySession(idToken);

		const res = NextResponse.json({ ok: true });

		return setSessionCookie(res, sessionCookie, Math.floor(SESSION_EXPIRES_IN_MS / 1000));
	} catch (err: any) {
		if (err.type === 'invalid-json') {
			return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
		}
		if (err.type === 'auth-error') {
			return NextResponse.json({ ok: false, error: 'invalid-token' }, { status: 401 });
		}
		if (err.type === 'bad-request') {
			return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
		}
		console.error('Session: unexpected error', err);
		return NextResponse.json({ ok: false, error: 'internal-error' }, { status: 500 });
	}
}

async function parseJsonBody(req: Request): Promise<Body> {
	try {
		return (await req.json()) as Body;
	} catch (e) {
		console.error('Session: invalid JSON', e);
		throw { type: 'invalid-json' };
	}
}

async function createAndVerifySession(idToken: string): Promise<string> {
	try {
		const sessionCookie = await authAdmin.auth.createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN_MS,
		});
		await authAdmin.auth.verifySessionCookie(sessionCookie, true);
		return sessionCookie;
	} catch (e) {
		console.error('Session: auth failure', e);
		throw { type: 'auth-error' };
	}
}
