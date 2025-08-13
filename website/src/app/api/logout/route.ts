import { clearSessionCookie } from '@/lib/firebase/session';
import { NextResponse } from 'next/server';

export async function POST() {
	try {
		const res = NextResponse.json({ ok: true });
		return clearSessionCookie(res);
	} catch (err) {
		console.error('Error clearing session cookie', err);
		return NextResponse.json({ ok: false, error: 'logout-failed' }, { status: 500 });
	}
}
