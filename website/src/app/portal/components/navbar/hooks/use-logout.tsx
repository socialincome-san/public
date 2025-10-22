import { useAuth } from '@/lib/firebase/hooks/useAuth';
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
				console.error('Logout API failed with status:', res.status);
			}

			await signOut(auth).catch((err) => {
				console.error('Firebase sign-out error:', err);
			});

			router.push('/portal/login');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	return { logout };
};
