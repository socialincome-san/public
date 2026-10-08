'use client';

import { CONFIRM_LOGIN_PATH_REGEX } from '@/lib/utils/regex';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

/**
 * Interstitial for email sign-in links (e.g. from navbar login flyout).
 * We do NOT consume the Firebase token here—we only show a "Click to continue" step.
 * This avoids link scanners (e.g. Microsoft Safe Links, Outlook) consuming the one-time
 * token when they pre-fetch the URL; the token is only used when the user clicks through
 * to finish-login.
 */
export default function ConfirmLoginPage() {
	const t = useTranslations('website-login');

	const continueToFinish = () => {
		const path = window.location.pathname.replace(CONFIRM_LOGIN_PATH_REGEX, '/finish-login');
		window.location.href = path + window.location.search;
	};

	return (
		<div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
			<h1 className="text-xl font-bold">{t('confirm-login.title')}</h1>
			<p className="text-muted-foreground max-w-sm">{t('confirm-login.body')}</p>
			<Button data-testid="confirm-login-button" onClick={continueToFinish}>
				{t('confirm-login.cta')}
			</Button>
			<Link className="text-muted-foreground text-sm underline" href="/">
				{t('confirm-login.return-home')}
			</Link>
		</div>
	);
}
