'use client';

import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { createSessionAction } from '@/lib/server-actions/session-actions';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { isSignInWithEmailLink, signInWithEmailLink, signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FinishLoginPage() {
	const { auth } = useAuth();
	const router = useRouter();

	const [status, setStatus] = useState<'checking' | 'signing-in' | 'error'>('checking');

	useEffect(() => {
		const run = async () => {
			const url = window.location.href;

			if (!isSignInWithEmailLink(auth, url)) {
				setStatus('error');
				return;
			}

			setStatus('signing-in');

			// only allow login from same device
			const email = localStorage.getItem('loginEmail');

			if (!email) {
				setStatus('error');
				return;
			}

			try {
				await signInWithEmailLink(auth, email, url);

				localStorage.removeItem('loginEmail');

				const user = auth.currentUser;
				if (!user) {
					throw new Error('No user after login');
				}

				const idToken = await user.getIdToken(true);
				const result = await createSessionAction(idToken);

				if (!result.success) {
					await signOut(auth);
					setStatus('error');
					return;
				}

				router.replace(`/${NEW_WEBSITE_SLUG}/auth/my-account`);
			} catch {
				setStatus('error');
			}
		};

		void run();
	}, [auth, router]);

	if (status === 'checking') {
		return <div className="flex min-h-screen items-center justify-center">Checking login…</div>;
	}

	if (status === 'signing-in') {
		return <div className="flex min-h-screen items-center justify-center">Signing you in…</div>;
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
			<p>Login failed.</p>
			<Link className="underline" href="/">
				Return home
			</Link>
		</div>
	);
}
