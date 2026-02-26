'use client';

import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Button, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { useParams } from 'next/navigation';

/**
 * Interstitial for old-website email sign-in links (e.g. from /login form).
 * We do NOT consume the Firebase token here—only show "Click to continue".
 * This avoids link scanners (e.g. Microsoft Safe Links) consuming the one-time
 * token; the token is only used when the user clicks through to the login page.
 */
export default function ConfirmLoginPage() {
	const params = useParams();
	const lang = (params?.lang as WebsiteLanguage) ?? 'en';
	const translator = useTranslator(lang, 'website-login');

	const continueToLogin = () => {
		const path = window.location.pathname.replace(/\/auth\/confirm-login\/?$/, '/login');
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('confirmed', 'true');
		const queryString = searchParams.toString();
		window.location.href = queryString ? `${path}?${queryString}` : path;
	};

	return (
		<div className="flex min-h-[20vh] flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
			<Typography weight="bold" size="2xl">
				{translator?.t('confirm-login.title')}
			</Typography>
			<Typography className="max-w-sm" color="muted-foreground">
				{translator?.t('confirm-login.body')}
			</Typography>
			<Button data-testid="confirm-login-button" onClick={continueToLogin}>
				{translator?.t('confirm-login.cta')}
			</Button>
			<Link className="text-muted-foreground text-sm underline" href="/">
				{translator?.t('confirm-login.return-home')}
			</Link>
		</div>
	);
}
