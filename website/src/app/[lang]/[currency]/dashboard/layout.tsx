import type { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { getWebsiteBasePath, toWebsiteCurrency } from '@/lib/i18n/utils';
import { requireSessions } from '@/server/session';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, currency } = await params;
	const basePath = getWebsiteBasePath(lang, toWebsiteCurrency(currency));
	await requireSessions('contributor', `${basePath}/login`);

	const t = await getTranslations('website-me');

	const sections = [
		{ href: `${basePath}/dashboard/subscriptions`, label: t('sections.contributions.subscriptions') },
		{ href: `${basePath}/dashboard/contributions`, label: t('sections.contributions.payments') },
		{
			href: `${basePath}/dashboard/donation-certificates`,
			label: t('sections.contributions.donation-certificates-long'),
		},
		{ href: `${basePath}/dashboard/profile`, label: t('profile.link') },
	];

	const breadcrumbLinks = [
		{ href: basePath, label: t('breadcrumb.website') },
		{ href: `${basePath}/dashboard`, label: t('breadcrumb.dashboard') },
	];

	return (
		<div className="w-site-width max-w-content mx-auto flex-1 pb-8">
			<Breadcrumb links={breadcrumbLinks} />
			<h1 data-testid="welcome-message-dashboard" className="py-8 text-5xl">
				{t('title.dashboard')}
			</h1>
			<TabNavigation sections={sections} />
			<Card>{children}</Card>
		</div>
	);
}
