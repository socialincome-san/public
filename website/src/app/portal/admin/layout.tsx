import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';

import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ROUTES } from '@/lib/constants/routes';
import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function DeliveryLayout({ children }: MonitoringLayoutProps) {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: ROUTES.portal, label: 'Portal' },
		{ href: ROUTES.portalAdmin, label: 'Admin' },
	];

	const sections = [
		{ href: ROUTES.portalAdminOrganizations, label: 'Organizations' },
		{ href: ROUTES.portalAdminUsers, label: 'Users' },
		{ href: ROUTES.portalAdminLocalPartners, label: 'Local Partners' },
		{ href: ROUTES.portalAdminCandidates, label: 'Candidate Pool' },
		{ href: ROUTES.portalAdminExpenses, label: 'Expenses' },
		{ href: ROUTES.portalAdminExchangeRates, label: 'Exchange Rates' },
		{ href: ROUTES.portalAdminCountries, label: 'Countries' },
		{ href: ROUTES.portalAdminMobileMoneyProviders, label: 'Mobile Money Providers' },
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
