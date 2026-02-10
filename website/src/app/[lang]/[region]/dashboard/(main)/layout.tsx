import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { PropsWithChildren } from 'react';
import { DefaultLayoutProps } from '../..';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang } = await params;

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: ['website-me'] });

	const sections = [
		{ href: '/dashboard/contributions', label: translator.t('sections.contributions.payments') },
		{ href: '/dashboard/subscriptions', label: translator.t('sections.contributions.subscriptions') },
		{
			href: '/dashboard/donation-certificates',
			label: translator.t('sections.contributions.donation-certificates-long'),
		},
	];

	const breadcrumbLinks = [
		{ href: '/', label: translator.t('breadcrumb.website') },
		{ href: '/dashboard', label: translator.t('breadcrumb.dashboard') },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 data-testid="welcome-message-dashboard" className="py-8 text-5xl">
				{translator.t('title.dashboard')}
			</h1>
			<TabNavigation sections={sections} />
			<Card>{children}</Card>
		</>
	);
}
