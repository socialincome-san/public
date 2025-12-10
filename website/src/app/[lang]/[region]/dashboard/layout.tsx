import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '..';

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

	return (
		<WebsiteAppShell contributor={contributor} lang={lang as WebsiteLanguage}>
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">{translator.t('sections.contributions.title')}</h1>
			</div>
			<TabNavigation sections={sections} />
			<Card>{children}</Card>
		</WebsiteAppShell>
	);
}
