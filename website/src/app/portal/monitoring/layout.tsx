import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { ROUTES } from '@/lib/constants/routes';

import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function MonitoringLayout({ children }: MonitoringLayoutProps) {
	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: ROUTES.portal, label: 'Portal' },
		{ href: ROUTES.portalMonitoring, label: 'Monitoring' },
	];

	const sections = [
		{ href: ROUTES.portalMonitoringPayoutConfirmation, label: 'Payout Confirmation' },
		{ href: ROUTES.portalMonitoringUpcomingSurveys, label: 'Upcoming Surveys' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">Monitoring</h1>

			<TabNavigation sections={sections} />

			<Card>
				<div>{children}</div>
			</Card>
		</>
	);
}
