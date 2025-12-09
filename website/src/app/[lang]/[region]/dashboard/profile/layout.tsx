import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '../..';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/dashboard/contributions', label: 'Dashboard' },
		{ href: '/dashboard/profile', label: 'Profile' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">Profile</h1>
			{children}
		</>
	);
}
