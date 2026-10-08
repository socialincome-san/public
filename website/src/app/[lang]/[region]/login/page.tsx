import type { DefaultPageProps } from '@/app/[lang]/[region]';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import { getRedirectPathAfterLoginAction } from '@/modules/auth/auth.actions';
import { getCurrentSessions } from '@/modules/auth/session.service';
import { redirect } from 'next/navigation';
import { LoginPageContent } from './login-page-content';

export const generateMetadata = async ({ params }: DefaultPageProps) => {
	const { lang } = await params;

	return getMetadata(lang as WebsiteLanguage, 'website-login');
};

const LoginPage = async ({ params, searchParams }: DefaultPageProps) => {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	const isFirebaseEmailLink = resolvedSearchParams.mode === 'signIn' || typeof resolvedSearchParams.oobCode === 'string';

	if (isFirebaseEmailLink) {
		const query = new URLSearchParams(resolvedSearchParams).toString();
		const search = query.length > 0 ? `?${query}` : '';
		redirect(`/${lang}/${region}/auth/confirm-login${search}`);
	}

	const sessionsResult = await getCurrentSessions();
	const sessions = sessionsResult.success ? sessionsResult.data : [];
	if (sessions.length > 0) {
		const redirectPathResult = await getRedirectPathAfterLoginAction();
		if (redirectPathResult.success) {
			redirect(redirectPathResult.data);
		}
	}

	const emailParam = resolvedSearchParams.email;
	const prefilledEmail = typeof emailParam === 'string' ? emailParam : '';

	return <LoginPageContent prefilledEmail={prefilledEmail} />;
};

export default LoginPage;
