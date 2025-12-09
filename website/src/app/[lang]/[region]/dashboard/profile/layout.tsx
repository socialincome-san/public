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
		{ href: `/${lang}/${region}`, label: translator.t('breadcrumb.website') },
		{ href: `/${lang}/${region}/dashboard/contributions`, label: translator.t('breadcrumb.dashboard') },
		{ href: `/${lang}/${region}/dashboard/profile`, label: translator.t('breadcrumb.profile') },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">{translator.t('title.profile')}</h1>
			{children}
		</>
	);
}
