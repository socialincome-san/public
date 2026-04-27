import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { getSessionByType } from '@/lib/firebase/current-account';

import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function DeliveryLayout({ children }: MonitoringLayoutProps) {
	const userSessionResult = await getSessionByType('user');
	if (!userSessionResult.success) {
		redirect('/login');
	}
	if (!userSessionResult.data.hasAnyOperatorProgramAccess) {
		redirect('/portal/programs');
	}

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/portal', label: 'Portal' },
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
