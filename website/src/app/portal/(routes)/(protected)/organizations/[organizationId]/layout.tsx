import { Card } from '@/app/portal/components/card';
import { TabNavigation } from '@/app/portal/components/tab-navigation';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';

import { Breadcrumb } from '@/app/portal/components/breadcrumb/breadcrumb';
import { OrganizationService } from '@socialincome/shared/src/database/services/organization/organization.service';
import { ReactNode } from 'react';

type OrganizationLayoutProps = {
	children: ReactNode;
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationLayout({ children, params }: OrganizationLayoutProps) {
	const { organizationId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const service = new OrganizationService();
	const result = await service.getOrganizationInformation(user.id, organizationId);

	if (!result.success) {
		return <div className="p-4">Error loading the organization</div>;
	}

	const { name: organizationName } = result.data;

	const sections = [
		{ href: `/portal/organizations/${organizationId}/members`, label: 'Members' },
		{ href: `/portal/organizations/${organizationId}/campaigns`, label: 'Campaigns' },
		{ href: `/portal/organizations/${organizationId}/programs`, label: 'Programs' },
	];

	const breadcrumbLinks = [
		{ href: '/portal', label: 'Home' },
		{ href: `/portal/organizations/${organizationId}/members`, label: organizationName },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">{organizationName}</h1>
			</div>

			<TabNavigation sections={sections} />

			<Card>
				<div>{children}</div>
			</Card>
		</>
	);
}
