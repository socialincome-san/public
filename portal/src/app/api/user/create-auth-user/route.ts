import { authAdmin, firestoreAdmin } from '@/firebase-admin';
import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types/user';
import { FirebaseError } from 'firebase-admin/lib/utils/error';
import { NextResponse } from 'next/server';

export type CreateAuthUserData = { email: string };
type CreateAuthUserRequest = { json(): Promise<CreateAuthUserData> } & Request;
export type CreateAuthUserResponse = { created: boolean };

/**
 * This endpoint creates an auth user for users in our user collection that do not have an auth user yet.
 */
export async function POST(request: CreateAuthUserRequest) {
	const { email } = await request.json();
	let response: CreateAuthUserResponse = { created: false };
	await authAdmin.auth
		.getUserByEmail(email) // If an auth user already exists, we don't do anything
		.catch(async (error: FirebaseError) => {
			// If there is no auth user, we create one if we find a user with the same email in the 'users' collection
			if (error.code === 'auth/user-not-found') {
				const user = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) => q.where('email', '==', email));
				if (user?.exists) {
					console.log(`Creating auth user for user with email ${email}`);
					// If we find a user in the 'users' collections, we create an auth user for them. If not, we do nothing.
					const authUser = await authAdmin.auth.createUser({ email, emailVerified: true });
					await user.ref.update({ auth_user_id: authUser.uid });
					response = { created: true };
				} else {
					console.log(`No user with email ${email} found in the 'users' collection. No auth user created.`);
				}
			}
		});
	return NextResponse.json(response);
}
