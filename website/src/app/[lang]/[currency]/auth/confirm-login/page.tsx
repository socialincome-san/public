'use client';

import { LoginPanel } from '@/components/login/login-panel';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import { CONFIRM_LOGIN_PATH_REGEX } from '@/lib/utils/regex';
import { Button } from '@socialincome/design-system/actions/button/button';
import { AuthStatus } from '@socialincome/design-system/feedback/auth-status/auth-status';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

/**
 * Interstitial for email sign-in links (e.g. from the login page).
 * We do NOT consume the Firebase token here—we only show a "Click to continue" step.
 * This avoids link scanners (e.g. Microsoft Safe Links, Outlook) consuming the one-time
 * token when they pre-fetch the URL; the token is only used when the user clicks through
 * to finish-login.
 */
export default function ConfirmLoginPage() {
	const t = useTranslations('website-login');
	const websiteBasePath = useWebsiteBasePath();

	const continueToFinish = () => {
		const path = window.location.pathname.replace(CONFIRM_LOGIN_PATH_REGEX, '/finish-login');
		window.location.href = path + window.location.search;
	};

	return (
		<LoginPanel>
			<AuthStatus status="confirm" title={t('confirm-login.title')} description={t('confirm-login.body')}>
				<Button data-testid="confirm-login-button" size="md" fullWidth onClick={continueToFinish}>
					{t('confirm-login.cta')}
				</Button>
				<Button variant="ghost" size="md" fullWidth asChild>
					<Link href={websiteBasePath}>{t('confirm-login.return-home')}</Link>
				</Button>
			</AuthStatus>
		</LoginPanel>
	);
}
