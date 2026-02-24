import { TabNavigation } from '@/components/tab-navigation';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';

import { CountryBadge } from '@/components/badges/country-badge';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { ReactNode } from 'react';

type ProgramLayoutProps = {
	children: ReactNode;
	params: Promise<{ programId: string }>;
};

export default async function ProgramLayout({ children, params }: ProgramLayoutProps) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const result = await services.program.getProgramWalletsProgramScoped(user.id, programId);

	if (!result.success) {
		return <div className="p-4">Error loading the program</div>;
	}

	const { programName, country } = result.data;

	const sections = [
		{ href: `/portal/programs/${programId}/overview`, label: 'Overview' },
		{ href: `/portal/programs/${programId}/recipients`, label: 'Recipients' },
		{ href: `/portal/programs/${programId}/payout-forecast`, label: 'Payout Forecast' },
		{ href: `/portal/programs/${programId}/surveys`, label: 'Surveys' },
	];

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/portal', label: 'Portal' },
		{ href: `/portal/programs/${programId}/recipients`, label: programName },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">{programName}</h1>

				<CountryBadge country={country} />
			</div>

			<TabNavigation sections={sections} />

			{children}
		</>
	);
}
