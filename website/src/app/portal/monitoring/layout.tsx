import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { requireSession } from '@/server/session';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function MonitoringLayout({ children }: MonitoringLayoutProps) {
	const user = await requireSession('user');
	if (!user.hasAnyOperatorProgramAccess) {
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
			<BlockWrapper marginTop="none" marginBottom="none">
				<h1 className="py-8 text-5xl">Monitoring</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>
		</>
	);
}
