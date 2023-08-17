'use client';

import { auth } from '@/firebase/client';
import { BaseContainer, Button, Typography } from '@socialincome/ui';
import { User, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		auth.onAuthStateChanged((user) => setUser(user));
	}, []);

	return (
		<BaseContainer>
			<Typography>{user?.displayName || 'No display name'}</Typography>
			<Typography>{user?.email || 'No email'}</Typography>

			<div className="flex flex-row space-x-4">
				<Button onClick={() => signOut(auth)}>Log out</Button>
				<Button onClick={() => router.push('/me/login')}>Log in</Button>
			</div>
		</BaseContainer>
	);
}
