import { Card } from '@/app/portal/components/card';
import { TabNavigation } from '@/app/portal/components/tab-navigation';

import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function MonitoringLayout({ children }: MonitoringLayoutProps) {
	const sections = [
		{ href: `/portal/monitoring/payout-confirmation`, label: 'Payout Confirmation' },
		{ href: `/portal/monitoring/upcoming-surveys`, label: 'Upcoming Surveys' },
	];

	return (
		<>
			<h1 className="py-8 text-5xl">Monitoring</h1>

			<TabNavigation sections={sections} />

			<Card>
				<div>{children}</div>
			</Card>
		</>
	);
}
