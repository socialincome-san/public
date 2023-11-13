'use client';

import { Button, Typography } from '@socialincome/ui';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from 'reactfire';

export default function Page() {
	const router = useRouter();
	const auth = useAuth();

	const onSignOut = async () => {
		await signOut(auth);
		router.push('/');
	};

	return (
		<div>
			<Typography size="lg" weight="semibold">
				Reset password
			</Typography>
			<Button onClick={onSignOut}>Sign out</Button>
		</div>
	);
}
