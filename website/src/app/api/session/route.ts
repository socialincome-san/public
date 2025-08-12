import { authAdmin } from '@/lib/firebase/firebase-admin';
import { SESSION_EXPIRES_IN_MS, setSessionCookie } from '@/lib/firebase/session';
import { NextResponse } from 'next/server';

type Body = { idToken?: string };

export async function POST(req: Request) {
	try {
		const { idToken } = (await req.json()) as Body;
		if (!idToken) {
			return NextResponse.json({ ok: false, error: 'missing-id-token' }, { status: 400 });
		}

		const sessionCookie = await authAdmin.auth.createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN_MS,
		});

		await authAdmin.auth.verifySessionCookie(sessionCookie, true);

		const res = NextResponse.json({ ok: true });
		return setSessionCookie(res, sessionCookie, Math.floor(SESSION_EXPIRES_IN_MS / 1000));
	} catch (err) {
		console.error('Error creating session cookie', err);
		return NextResponse.json({ ok: false, error: 'invalid-token' }, { status: 401 });
	}
}
