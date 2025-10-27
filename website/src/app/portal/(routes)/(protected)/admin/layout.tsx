import { Breadcrumb } from '@/app/portal/components/breadcrumb/breadcrumb';
import { Card } from '@/app/portal/components/card';
import { TabNavigation } from '@/app/portal/components/tab-navigation';

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
		{ href: `/portal/admin/local-partners`, label: 'Local Partners' },
		{ href: `/portal/admin/expenses`, label: 'Expenses' },
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
