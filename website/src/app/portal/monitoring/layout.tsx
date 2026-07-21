import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { BlockWrapper } from '@/components/block-wrapper';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { getSessionByType } from '@/lib/firebase/current-account';

import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function MonitoringLayout({ children }: MonitoringLayoutProps) {
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
		{ href: '/portal/monitoring', label: 'Monitoring' },
	];

	const sections = [
		{ href: `/portal/monitoring/payout-confirmation`, label: 'Payout Confirmation' },
		{ href: `/portal/monitoring/upcoming-surveys`, label: 'Upcoming Surveys' },
		{ href: `/portal/monitoring/upcoming-onboarding`, label: 'Upcoming Onboarding' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
				<h1 className="py-8 text-5xl">Monitoring</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>

		</>
	);
}
