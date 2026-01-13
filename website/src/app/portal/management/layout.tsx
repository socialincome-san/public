import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';

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
		// Program access–based
		{ href: `/portal/management/recipients`, label: 'Recipients' },
		{ href: `/portal/management/ongoing-payouts`, label: 'Ongoing Payouts' },
		{ href: `/portal/management/surveys`, label: 'Surveys' },

		// Organization access–based
		{ href: `/portal/management/contributors`, label: 'Contributors' },
		{ href: `/portal/management/contributions`, label: 'Contributions' },
		{ href: `/portal/management/donation-certificates`, label: 'Donation Certificates' },
		{ href: `/portal/management/campaigns`, label: 'Campaigns' },
		{ href: `/portal/management/members`, label: 'Organization Members' },
		{ href: `/portal/management/candidate-pool`, label: 'Candidate Pool' },
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
