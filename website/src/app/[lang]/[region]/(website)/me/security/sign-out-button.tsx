'use client';

import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { Button, Typography } from '@socialincome/ui';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

type SignOutButtonProps = {
	translations: {
		title: string;
		buttonText: string;
	};
};

export function SignOutButton({ translations }: SignOutButtonProps) {
	const router = useRouter();
	const { auth } = useAuth();

	const handleSignOut = async () => {
		let ok = false;
		try {
			const res = await fetch('/api/logout', {
				method: 'POST',
				credentials: 'include',
			});
			ok = res.ok;
			if (!ok) console.error('Logout API failed:', res.status);
		} catch (e) {
			console.error('Logout API error:', e);
		} finally {
			await signOut(auth).catch(() => {});
			if (ok) router.push('/');
		}
	};

	return (
		<div>
			<Typography weight="medium" size="lg">
				{translations.title}
			</Typography>
			<Button variant="secondary" className="mt-2" onClick={handleSignOut}>
				{translations.buttonText}
			</Button>
		</div>
	);
}
