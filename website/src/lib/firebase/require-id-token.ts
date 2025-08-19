import { authAdmin } from '@/lib/firebase/firebase-admin';

export async function requireIdToken(request: Request) {
	const header = request.headers.get('authorization');
	if (!header?.startsWith('Bearer ')) return null;
	const token = header.slice('Bearer '.length);
	try {
		return await authAdmin.auth.verifyIdToken(token);
	} catch (e) {
		console.error('Auth error:', e);
		return null;
	}
}
