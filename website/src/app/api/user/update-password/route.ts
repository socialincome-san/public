import { authorizeRequest, handleApiError } from '@/app/api/auth';
import { authAdmin } from '@/firebase-admin';

export type UpdatePasswordData = { newPassword: string };
type UpdatePasswordRequest = { json(): Promise<UpdatePasswordData> } & Request;

export async function POST(request: UpdatePasswordRequest) {
	try {
		const userDoc = await authorizeRequest(request);
		const { newPassword } = await request.json();
		await authAdmin.auth.updateUser(userDoc.get('auth_user_id'), { password: newPassword });
		console.log(`Password updated for user with email ${userDoc.get('email')}`);
		return new Response(null, { status: 200, statusText: 'Password updated' });
	} catch (error: any) {
		return handleApiError(error);
	}
}
