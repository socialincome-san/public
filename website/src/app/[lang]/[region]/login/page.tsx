import type { DefaultPageProps } from '@/app/[lang]/[region]';
import { redirect } from 'next/navigation';

const LoginPage = async ({ params, searchParams }: DefaultPageProps) => {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	const isFirebaseEmailLink =
		resolvedSearchParams.mode === 'signIn' || typeof resolvedSearchParams.oobCode === 'string';

	if (isFirebaseEmailLink) {
		const query = new URLSearchParams(resolvedSearchParams).toString();
		const search = query.length > 0 ? `?${query}` : '';
		redirect(`/${lang}/${region}/auth/confirm-login${search}`);
	}

	redirect(`/${lang}/${region}`);
};

export default LoginPage;
