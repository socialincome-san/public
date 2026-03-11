import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { ROUTES } from '@/lib/constants/routes';
import { getSessionsOrRedirect } from '@/lib/firebase/current-account';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '..';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const sessions = await getSessionsOrRedirect();
	if (!sessions.find((s) => s.type === 'contributor')) {
		redirect(ROUTES.login);
	}

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

	const sections = [
		{ href: ROUTES.dashboardContributions, label: translator.t('sections.contributions.payments') },
		{ href: ROUTES.dashboardSubscriptions, label: translator.t('sections.contributions.subscriptions') },
		{
			href: ROUTES.dashboardDonationCertificates,
			label: translator.t('sections.contributions.donation-certificates-long'),
		},
		{ href: ROUTES.dashboardProfile, label: translator.t('profile.link') },
	];

	const breadcrumbLinks = [
		{ href: '/', label: translator.t('breadcrumb.website') },
		{ href: ROUTES.dashboard, label: translator.t('breadcrumb.dashboard') },
	];

	return (
		<WebsiteAppShell sessions={sessions} lang={lang as WebsiteLanguage} region={region} scope="dashboard">
			<Breadcrumb links={breadcrumbLinks} />
			<h1 data-testid="welcome-message-dashboard" className="py-8 text-5xl">
				{translator.t('title.dashboard')}
			</h1>
			<TabNavigation sections={sections} />
			<Card>{children}</Card>
		</WebsiteAppShell>
	);
}
