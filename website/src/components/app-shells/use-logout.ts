'use client';

import { signOut } from '@/lib/firebase/client-auth';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { logoutAction } from '@/modules/auth/auth.actions';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
	const router = useRouter();
	const { auth } = useAuth();

	const logout = async () => {
		try {
			const result = await logoutAction();

			if (!result.success) {
				console.error('Logout failed', { error: result.error });
			}

			const firebaseResult = await signOut(auth);
			if (!firebaseResult.success) {
				console.error('Firebase sign-out error', { error: firebaseResult.error });
			}

			router.push('/login');
		} catch (error) {
			console.error('Logout error', { error });
		}
	};

	return { logout };
};
