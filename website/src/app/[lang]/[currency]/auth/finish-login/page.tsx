'use client';

import { claimPendingCampaignsFromLogin } from '@/components/login/claim-pending-campaigns-from-login';
import { parseCampaignsQueryParam } from '@/components/login/parse-campaigns-query-param';
import { finishSignInWithEmailLink, isSignInLink, signOut } from '@/lib/firebase/client-auth';
import { useAuth } from '@/lib/firebase/hooks/use-auth';
import { getWebsiteBasePath } from '@/lib/i18n/utils';
import { useWebsiteBasePath, useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { createSessionAction, getRedirectPathAfterLoginAction } from '@/modules/auth/auth.actions';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const getEmailFromLoginUrl = (url: string): string | null => {
	const searchParams = new URL(url).searchParams;
	const email = searchParams.get('email');
	if (email) {
		return email;
	}

	const continueUrl = searchParams.get('continueUrl');
	if (!continueUrl) {
		return null;
	}

	return new URL(continueUrl).searchParams.get('email');
};

export default function FinishLoginPage() {
	const { auth } = useAuth();
	const router = useRouter();
	const params = useParams<{ lang?: string }>();
	const currency = useWebsiteCurrency();
	const websiteBasePath = useWebsiteBasePath();

	const [status, setStatus] = useState<'checking' | 'signing-in' | 'error'>('checking');

	useEffect(() => {
		const run = async () => {
			const url = window.location.href;

			if (!isSignInLink(auth, url)) {
				setStatus('error');

				return;
			}

			setStatus('signing-in');

			try {
				const email = getEmailFromLoginUrl(url);
				if (!email) {
					throw new Error('Missing email in login URL');
				}

				const signInResult = await finishSignInWithEmailLink(auth, email, url);
				if (!signInResult.success) {
					setStatus('error');

					return;
				}

				const result = await createSessionAction(signInResult.data.idToken);

				if (!result.success) {
					await signOut(auth);
					setStatus('error');

					return;
				}

				const claimResult = await claimPendingCampaignsFromLogin(parseCampaignsQueryParam(url));
				const lang = typeof params.lang === 'string' ? params.lang : null;

				if (claimResult.campaignSlug && lang) {
					router.replace(`${getWebsiteBasePath(lang, currency)}/campaigns/${claimResult.campaignSlug}`);

					return;
				}

				const redirectPathResult = await getRedirectPathAfterLoginAction({ lang, currency });
				if (!redirectPathResult.success) {
					await signOut(auth);
					setStatus('error');

					return;
				}
				router.replace(redirectPathResult.data);
			} catch {
				setStatus('error');
			}
		};

		void run();
	}, [auth, params.lang, currency, router]);

	if (status === 'checking') {
		return <div className="flex min-h-screen items-center justify-center">Checking login…</div>;
	}

	if (status === 'signing-in') {
		return <div className="flex min-h-screen items-center justify-center">Signing you in…</div>;
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
			<p>Login failed.</p>
			<Link className="underline" href={websiteBasePath}>
				Return home
			</Link>
		</div>
	);
}
