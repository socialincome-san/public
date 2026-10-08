import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { requireSessions } from '@/server/session';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';

export default async function Layout({ children }: PropsWithChildren) {
	await requireSessions('contributor');

	const t = await getTranslations('website-me');

	const sections = [
		{ href: '/dashboard/subscriptions', label: t('sections.contributions.subscriptions') },
		{ href: '/dashboard/contributions', label: t('sections.contributions.payments') },
		{
			href: '/dashboard/donation-certificates',
			label: t('sections.contributions.donation-certificates-long'),
		},
		{ href: '/dashboard/profile', label: t('profile.link') },
	];

	const breadcrumbLinks = [
		{ href: '/', label: t('breadcrumb.website') },
		{ href: '/dashboard', label: t('breadcrumb.dashboard') },
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
