'use client';

import { Button } from '@/components/button';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';

/**
 * Interstitial for new-website email sign-in links (e.g. from navbar login flyout).
 * We do NOT consume the Firebase token here—we only show a "Click to continue" step.
 * This avoids link scanners (e.g. Microsoft Safe Links, Outlook) consuming the one-time
 * token when they pre-fetch the URL; the token is only used when the user clicks through
 * to finish-login.
 */
export default function ConfirmLoginPage() {
	const params = useParams();
	const lang = (params?.lang as WebsiteLanguage) ?? 'en';
	const translator = useTranslator(lang, 'website-login');

	const continueToFinish = () => {
		const path = window.location.pathname.replace(/\/confirm-login\/?$/, '/finish-login');
		window.location.href = path + window.location.search;
	};

	return (
		<div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
			<h1 className="text-xl font-semibold">{translator?.t('confirm-login.title')}</h1>
			<p className="text-muted-foreground max-w-sm">{translator?.t('confirm-login.body')}</p>
			<Button data-testid="confirm-login-button" onClick={continueToFinish}>
				{translator?.t('confirm-login.cta')}
			</Button>
			<Link className="text-muted-foreground text-sm underline" href="/">
				{translator?.t('confirm-login.return-home')}
			</Link>
		</div>
	);
}
