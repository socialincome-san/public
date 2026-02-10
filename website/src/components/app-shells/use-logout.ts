'use client';

import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { logoutAction } from '@/lib/server-actions/session-actions';
import { logger } from '@/lib/utils/logger';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
	const router = useRouter();
	const { auth } = useAuth();

	const logout = async () => {
		try {
			const result = await logoutAction();

			if (!result.success) {
				logger.error('Logout failed', { error: result.error });
			}

			await signOut(auth).catch((err) => {
				logger.error('Firebase sign-out error', { error: err });
			});

			router.push('/login');
		} catch (error) {
			logger.error('Logout error', { error });
		}
	};

	return { logout };
};
