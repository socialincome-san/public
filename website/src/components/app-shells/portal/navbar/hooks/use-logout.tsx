import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { logger } from '@/utils/logger';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
	const router = useRouter();
	const { auth } = useAuth();

	const logout = async () => {
		try {
			const res = await fetch('/api/logout', {
				method: 'POST',
				credentials: 'include',
			});

			if (!res.ok) {
				logger.error('Logout API failed', { status: res.status });
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
