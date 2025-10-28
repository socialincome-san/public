import { Breadcrumb } from '@/app/portal/components/breadcrumb/breadcrumb';
import { Card } from '@/app/portal/components/card';
import { TabNavigation } from '@/app/portal/components/tab-navigation';

import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function MonitoringLayout({ children }: MonitoringLayoutProps) {
	const breadcrumbLinks = [
		{ href: '/portal', label: 'Home' },
		{ href: '/portal/monitoring', label: 'Monitoring' },
	];

	const sections = [
		{ href: `/portal/monitoring/payouts`, label: 'Payouts' },
		{ href: `/portal/monitoring/upcoming-surveys`, label: 'Upcoming Surveys' },
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
