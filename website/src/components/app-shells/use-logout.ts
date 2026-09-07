'use client';

import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { logoutAction } from '@/lib/server-actions/session-actions';
import { signOut } from 'firebase/auth';
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

			await signOut(auth).catch((err: unknown) => {
				console.error('Firebase sign-out error', err);
			});

			router.push('/login');
		} catch (error) {
			console.error('Logout error', { error });
		}
	};

	return { logout };
};
