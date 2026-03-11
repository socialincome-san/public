import { TabNavigation } from '@/components/tab-navigation';
import { ROUTES } from '@/lib/constants/routes';
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

	const result = await services.read.program.getProgramWalletsProgramScoped(user.id, programId);

	if (!result.success) {
		return <div className="p-4">Error loading the program</div>;
	}

	const { programName, country } = result.data;

	const sections = [
		{ href: ROUTES.portalProgramOverview(programId), label: 'Overview' },
		{ href: ROUTES.portalProgramRecipients(programId), label: 'Recipients' },
		{ href: ROUTES.portalProgramPayoutForecast(programId), label: 'Payout Forecast' },
		{ href: ROUTES.portalProgramSurveys(programId), label: 'Surveys' },
	];

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: ROUTES.portal, label: 'Portal' },
		{ href: ROUTES.portalProgramRecipients(programId), label: programName },
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
