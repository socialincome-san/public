import { authAdmin, getUserDocFromAuthToken } from '@/firebase-admin';

export type UpdatePasswordData = { firebaseAuthToken: string; newPassword: string };
type UpdatePasswordRequest = { json(): Promise<UpdatePasswordData> } & Request;

export async function POST(request: UpdatePasswordRequest) {
	const { firebaseAuthToken, newPassword } = await request.json();

	if (!firebaseAuthToken || !newPassword) {
		return new Response(null, {
			status: 400,
			statusText: 'Missing one of the following parameters: firebaseAuthToken, newPassword',
		});
	}
	const userDoc = await getUserDocFromAuthToken(firebaseAuthToken);
	if (!userDoc) {
		return new Response(null, { status: 400, statusText: 'User not found' });
	}
	return authAdmin.auth
		.updateUser(userDoc.get('auth_user_id'), { password: newPassword })
		.then(() => {
			console.log(`Password updated for user with email ${userDoc.get('email')}`);
			return new Response(null, { status: 200, statusText: 'Password updated' });
		})
		.catch((error: Error) => {
			console.error(error);
			return new Response(null, { status: 500, statusText: error.message });
		});
}
