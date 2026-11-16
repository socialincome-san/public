'use client';

import { claimPendingCampaignsFromLogin } from '@/components/login/claim-pending-campaigns-from-login';
import { LoginPanel } from '@/components/login/login-panel';
import { getEmailFromLoginUrl, parseCampaignsQueryParam } from '@/components/login/parse-campaigns-query-param';
import { finishSignInWithEmailLink, isSignInLink, signOut } from '@/lib/firebase/client-auth';
import { useAuth } from '@/lib/firebase/hooks/use-auth';
import { getWebsiteBasePath } from '@/lib/i18n/utils';
import { useWebsiteBasePath, useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { createSessionAction, getRedirectPathAfterLoginAction } from '@/modules/auth/auth.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { AuthStatus } from '@socialincome/design-system/feedback/auth-status/auth-status';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function FinishLoginPage() {
	const { auth } = useAuth();
	const router = useRouter();
	const params = useParams<{ lang?: string }>();
	const currency = useWebsiteCurrency();
	const websiteBasePath = useWebsiteBasePath();
	const t = useTranslations('website-login');

	const [status, setStatus] = useState<'checking' | 'signing-in' | 'error'>('checking');
	const started = useRef(false);

	useEffect(() => {
		// The one-time link code can only be used once, so a second run (e.g. Strict Mode) would fail.
		if (started.current) {
			return;
		}
		started.current = true;

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

	if (status === 'error') {
		return (
			<LoginPanel>
				<AuthStatus status="error" title={t('finish-login.error-title')} description={t('finish-login.error-description')}>
					<Button size="md" fullWidth asChild>
						<Link href={`${websiteBasePath}/login`}>{t('finish-login.error-cta')}</Link>
					</Button>
				</AuthStatus>
			</LoginPanel>
		);
	}

	return (
		<LoginPanel>
			{status === 'checking' ? (
				<AuthStatus status="loading" title={t('finish-login.checking')} />
			) : (
				<AuthStatus
					status="loading"
					title={t('finish-login.signing-in')}
					description={t('finish-login.signing-in-description')}
				/>
			)}
		</LoginPanel>
	);
}
