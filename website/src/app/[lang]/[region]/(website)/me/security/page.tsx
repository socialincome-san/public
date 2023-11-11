'use client';

import { Button, Typography } from '@socialincome/ui';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from 'reactfire';

export default function Page() {
	const router = useRouter();
	const auth = useAuth();

	return (
		<div>
			<Typography size="lg" weight="semibold">
				Reset password
			</Typography>
			<Button onClick={() => signOut(auth).then(() => router.push('/'))}>Sign out</Button>
		</div>
	);
}
