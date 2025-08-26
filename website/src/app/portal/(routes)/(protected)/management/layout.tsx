import { Breadcrumb } from '@/app/portal/components/breadcrumb/breadcrumb';
import { Card } from '@/app/portal/components/card';
import { TabNavigation } from '@/app/portal/components/tab-navigation';

import { ReactNode } from 'react';

type ManagementLayoutProps = {
	children: ReactNode;
};

export default async function ManagementLayout({ children }: ManagementLayoutProps) {
	const breadcrumbLinks = [
		{ href: '/portal', label: 'Home' },
		{ href: '/portal/management', label: 'Management' },
	];

	const sections = [
		{ href: `/portal/management/recipients`, label: 'Recipients' },
		{ href: `/portal/management/ongoing-payouts`, label: 'Ongoing payouts' },
		{ href: `/portal/management/contributors`, label: 'Contributors' },
		{ href: `/portal/management/contributions`, label: 'Contributions' },
		{ href: `/portal/management/campaigns`, label: 'Campaigns' },
		{ href: `/portal/management/surveys`, label: 'Surveys' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">Management</h1>

			<TabNavigation sections={sections} />

			<Card>
				<div>{children}</div>
			</Card>
		</>
	);
}
