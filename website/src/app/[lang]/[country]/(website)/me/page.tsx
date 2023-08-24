'use client';

import { auth } from '@/firebase/client';
import { useAuthUser } from '@/hooks/useAuthUser';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
	const router = useRouter();
	const [user, isReady] = useAuthUser();

	useEffect(() => {
		if (isReady && user === null) router.push('./me/login');
	});

	return (
		<BaseContainer className="bg-base-blue min-h-screen">
			{isReady && (
				<div className="flex flex-col items-center">
					<Typography>{user?.displayName || 'No display name'}</Typography>
					<Typography>{user?.email || 'No email'}</Typography>

					<div className="flex flex-row space-x-4">
						<Button onClick={() => signOut(auth)}>Log out</Button>
					</div>
				</div>
			)}
		</BaseContainer>
	);
}
