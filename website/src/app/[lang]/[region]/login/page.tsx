import type { DefaultPageProps } from '@/app/[lang]/[region]';
import { getCurrentSessions } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getRedirectPathAfterLoginAction } from '@/lib/server-actions/session-actions';
import { getMetadata } from '@/lib/utils/metadata';
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

	const sessions = await getCurrentSessions();
	if (sessions.length > 0) {
		const redirectPathResult = await getRedirectPathAfterLoginAction();
		if (redirectPathResult.success) {
			redirect(redirectPathResult.data);
		}
	}

	return <LoginPageContent lang={lang as WebsiteLanguage} />;
};

export default LoginPage;
