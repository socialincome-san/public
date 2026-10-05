import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { requireSession } from '@/server/session';
import { BlockWrapper } from '@socialincome/design-system/block-wrapper/block-wrapper';
import { Card } from '@socialincome/design-system/card/card';

import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

type ManagementLayoutProps = {
	children: ReactNode;
};

export default async function ManagementLayout({ children }: ManagementLayoutProps) {
	const user = await requireSession('user');
	if (!user.hasAnyOperatorProgramAccess) {
		redirect('/portal/programs');
	}

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/portal', label: 'Portal' },
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
		{ href: `/portal/management/subscriptions`, label: 'Subscriptions' },
		{ href: `/portal/management/donation-certificates`, label: 'Donation Certificates' },
		{ href: `/portal/management/campaigns`, label: 'Campaigns' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
				<h1 className="py-8 text-5xl">Management</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>
		</>
	);
}
