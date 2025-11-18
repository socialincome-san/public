import { Card } from '@/app/portal/components/card';
import { TabNavigation } from '@/app/portal/components/tab-navigation';
import { WebsiteAppShell } from '@/components/app-shell/website/app-shell';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '..';

export default async function DashboardLayout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	const sections = [
		{ href: `/${lang}/${region}/dashboard/contributions`, label: 'Contributions' },
		{ href: `/${lang}/${region}/dashboard/subscriptions`, label: 'Subscriptions' },
	];

	return (
		<WebsiteAppShell contributor={contributor}>
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">Dashboard</h1>
			</div>
			<TabNavigation sections={sections} />
			<Card>{children}</Card>
		</WebsiteAppShell>
	);
}
