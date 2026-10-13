import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import { requireAdmin } from '@/server/session';
import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function DeliveryLayout({ children }: MonitoringLayoutProps) {
	await requireAdmin();

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/portal', label: 'Portal' },
		{ href: '/portal/admin', label: 'Admin' },
	];

	const sections = [
		{ href: `/portal/admin/organizations`, label: 'Organizations' },
		{ href: `/portal/admin/users`, label: 'Users' },
		{ href: `/portal/admin/local-partners`, label: 'Local Partners' },
		{ href: `/portal/admin/candidates`, label: 'Candidate Pool' },
		{ href: `/portal/admin/expenses`, label: 'Expenses' },
		{ href: `/portal/admin/exchange-rates`, label: 'Exchange Rates' },
		{ href: `/portal/admin/countries`, label: 'Countries' },
		{ href: `/portal/admin/focuses`, label: 'Focuses' },
		{ href: `/portal/admin/mobile-money-providers`, label: 'Mobile Money Providers' },
		{ href: `/portal/admin/sent-mails`, label: 'Sent emails' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper marginTop="none" marginBottom="none">
				<h1 className="py-8 text-5xl">Admin</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>
		</>
	);
}
