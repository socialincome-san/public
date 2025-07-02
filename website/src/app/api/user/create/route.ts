import { authAdmin, firestoreAdmin } from '@/lib/firebase/firebase-admin';
import { User } from '@socialincome/shared/src/types/user';
import { rndString } from '@socialincome/shared/src/utils/crypto';

export type CreateUserRequest = {
	email: string;
};

export async function POST(request: CreateUserRequest & Request) {
	const { email } = await request.json();
	const userDoc = await firestoreAdmin.collection<User>('users').where('email', '==', email).get();
	if (userDoc.empty) {
		return new Response(null, { status: 400, statusText: 'User not found' });
	}

	const authUserId = userDoc.docs[0].get('auth_user_id');

	if (authUserId) {
		return new Response(null, { status: 400, statusText: 'Auth user already exists' });
	}

	try {
		const userRecord = await authAdmin.auth.createUser({
			email: email,
			password: await rndString(16),
		});

		await userDoc.docs[0].ref.update({
			auth_user_id: userRecord.uid,
		});

		return new Response(null, { status: 200 });
	} catch (error) {
		console.error('Failed to create auth user', error);
		return new Response(null, { status: 500, statusText: 'Failed to create user' });
	}
}
