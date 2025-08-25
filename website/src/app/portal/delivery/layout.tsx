import { Breadcrumb } from '@/app/portal/components/breadcrumb/breadcrumb';
import { Card } from '@/app/portal/components/card';
import { TabNavigation } from '@/app/portal/components/tab-navigation';

import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function DeliveryLayout({ children }: MonitoringLayoutProps) {
	const breadcrumbLinks = [
		{ href: '/', label: 'Home' },

		{ href: '/portal/delivery', label: 'Delivery' },
	];

	const sections = [{ href: `/portal/delivery/make-payouts`, label: 'Make Payouts' }];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">Delivery</h1>

			<TabNavigation sections={sections} />

			<Card>
				<div>{children}</div>
			</Card>
		</>
	);
}
