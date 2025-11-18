import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';

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
		{ href: `/portal/monitoring/payout-confirmation`, label: 'Payout Confirmation' },
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
