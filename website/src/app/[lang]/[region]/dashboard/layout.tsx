import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { notFound } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '..';

const ENABLE_PORTAL = process.env.NEXT_PUBLIC_FEATURE_ENABLE_PORTAL === 'true';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	if (!ENABLE_PORTAL) notFound();

	const { lang, region } = await params;
	const contributor = await getAuthenticatedContributorOrRedirect();

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	const sections = [
		{ href: `/${lang}/${region}/dashboard/contributions`, label: 'Contributions' },
		{ href: `/${lang}/${region}/dashboard/subscriptions`, label: 'Subscriptions' },
		{ href: `/${lang}/${region}/dashboard/donation-certificates`, label: 'Donation Certificates' },
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
