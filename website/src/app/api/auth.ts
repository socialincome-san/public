import { authAdmin, firestoreAdmin } from '@/lib/firebase/firebase-admin';
import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types/user';

export const getUserDocFromAuthToken = async (token: string | undefined) => {
	if (!token) return undefined;
	const decodedToken = await authAdmin.auth.verifyIdToken(token, true);
	return await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) =>
		q.where('auth_user_id', '==', decodedToken.uid),
	);
};

export class AuthError extends Error {}
export const authorizeRequest = async (request: Request) => {
	const { searchParams } = new URL(request.url);
	const firebaseAuthToken = searchParams.get('firebaseAuthToken');
	if (!firebaseAuthToken) {
		throw new Error('Missing firebaseAuthToken');
	}
	const userDoc = await getUserDocFromAuthToken(firebaseAuthToken);
	if (!userDoc) {
		throw new Error('No user found');
	}
	return userDoc;
};

export const handleApiError = (error: any) => {
	if (error instanceof AuthError) {
		return new Response(null, { status: 401, statusText: error.message });
	}
	return new Response(null, { status: 500, statusText: error.message });
};
