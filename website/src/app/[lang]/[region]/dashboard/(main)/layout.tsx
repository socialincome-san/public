import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '../..';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

	const sections = [
		{ href: `/${lang}/${region}/dashboard/contributions`, label: translator.t('sections.contributions.payments') },
		{ href: `/${lang}/${region}/dashboard/subscriptions`, label: translator.t('sections.contributions.subscriptions') },
		{
			href: `/${lang}/${region}/dashboard/donation-certificates`,
			label: translator.t('sections.contributions.donation-certificates-long'),
		},
	];

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/dashboard', label: 'Dashboard' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">Dashboard</h1>
			<TabNavigation sections={sections} />
			<Card>{children}</Card>
		</>
	);
}
