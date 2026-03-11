import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';
import { ROUTES } from '@/lib/constants/routes';

import { ReactNode } from 'react';

type ManagementLayoutProps = {
	children: ReactNode;
};

export default async function ManagementLayout({ children }: ManagementLayoutProps) {
	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: ROUTES.portal, label: 'Portal' },
		{ href: ROUTES.portalManagement, label: 'Management' },
	];

	const sections = [
		// Program access–based
		{ href: ROUTES.portalManagementRecipients, label: 'Recipients' },
		{ href: ROUTES.portalManagementOngoingPayouts, label: 'Ongoing Payouts' },
		{ href: ROUTES.portalManagementSurveys, label: 'Surveys' },

		// Organization access–based
		{ href: ROUTES.portalManagementContributors, label: 'Contributors' },
		{ href: ROUTES.portalManagementContributions, label: 'Contributions' },
		{ href: ROUTES.portalManagementDonationCertificates, label: 'Donation Certificates' },
		{ href: ROUTES.portalManagementCampaigns, label: 'Campaigns' },
		{ href: ROUTES.portalManagementMembers, label: 'Organization Members' },
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
