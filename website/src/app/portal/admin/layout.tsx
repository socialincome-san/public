import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';

import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function DeliveryLayout({ children }: MonitoringLayoutProps) {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const breadcrumbLinks = [
		{ href: '/portal', label: 'Home' },
		{ href: '/portal/admin', label: 'Admin' },
	];

	const sections = [
		{ href: `/portal/admin/organizations`, label: 'Organizations' },
		{ href: `/portal/admin/users`, label: 'Users' },
		{ href: `/portal/admin/local-partners`, label: 'Local Partners' },
		{ href: `/portal/admin/candidates`, label: 'Candidates Pool' },
		{ href: `/portal/admin/expenses`, label: 'Expenses' },
		{ href: `/portal/admin/exchange-rates`, label: 'Exchange Rates' },
		{ href: `/portal/admin/countries`, label: 'Countries' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">Admin</h1>

			<TabNavigation sections={sections} />

			<Card>
				<div>{children}</div>
			</Card>
		</>
	);
}
