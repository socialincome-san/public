import { Card } from '@/app/portal/components/custom/card';
import { TabNavigation } from '@/app/portal/components/custom/tab-navigation';

import { ReactNode } from 'react';

type ManagementLayoutProps = {
	children: ReactNode;
};

export default async function ManagementLayout({ children }: ManagementLayoutProps) {
	const sections = [
		{ href: `/portal/management/recipients`, label: 'Recipients' },
		{ href: `/portal/management/ongoing-payments`, label: 'Ongoing payments' },
		{ href: `/portal/management/contributors`, label: 'Contributors' },
		{ href: `/portal/management/contributions`, label: 'Contributions' },
		{ href: `/portal/management/fundraising`, label: 'Fundraising' },
		{ href: `/portal/management/surveys`, label: 'Surveys' },
	];

	return (
		<>
			<h1 className="py-8 text-5xl">Management</h1>

			<TabNavigation sections={sections} />

			<Card>
				<div>{children}</div>
			</Card>
		</>
	);
}
