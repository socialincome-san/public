import { authAdmin, firestoreAdmin } from '@/firebase/admin';
import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types';
import { NextResponse } from 'next/server';

export type ResetPasswordData = {
	email: string;
};
type ResetPasswordRequest = { json(): Promise<ResetPasswordData> } & Request;

/**
 * This endpoint creates an auth user for users in our user collection that do not have an auth user yet.
 */
export async function POST(request: ResetPasswordRequest) {
	const { email } = await request.json();
	return await authAdmin.auth
		.getUserByEmail(email)
		.then(() => NextResponse.json({ created: false })) // If an auth user already exists, we don't do anything
		.catch(async () => {
			// If there is no auth user we create one if we find a user with the same email in the users collection
			const user = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) => q.where('email', '==', email));
			if (user?.exists) {
				const authUser = await authAdmin.auth.createUser({
					email,
					emailVerified: true,
				});
				await user.ref.update({ authUserId: authUser.uid });
				return NextResponse.json({ created: true });
			} else {
				return NextResponse.json({ created: false });
			}
		});
}
