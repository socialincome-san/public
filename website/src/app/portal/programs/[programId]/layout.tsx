import { Badge } from '@/app/portal/components/badge';
import { Button } from '@/app/portal/components/button';
import { Card } from '@/app/portal/components/card';
import { TabNavigation } from '@/app/portal/components/tab-navigation';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

import { CountryBadge } from '@/app/portal/components/badges/country-badge';
import { Breadcrumb } from '@/app/portal/components/breadcrumb/breadcrumb';
import { Pen } from 'lucide-react';
import { ReactNode } from 'react';

type ProgramLayoutProps = {
	children: ReactNode;
	params: Promise<{ programId: string }>;
};

export default async function ProgramLayout({ children, params }: ProgramLayoutProps) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ProgramService();
	const result = await service.getProgramWalletViewProgramScoped(user.id, programId);

	if (!result.success) {
		return <div className="p-4">Error loading the program</div>;
	}

	const { programName, permission } = result.data;
	const isOperator = permission === 'operator';

	const sections = [
		{ href: `/portal/programs/${programId}/overview`, label: 'Overview' },
		{ href: `/portal/programs/${programId}/recipients`, label: 'Recipients' },
		{ href: `/portal/programs/${programId}/finances`, label: 'Finances' },
		{ href: `/portal/programs/${programId}/campaigns`, label: 'Campaigns' },
		{ href: `/portal/programs/${programId}/surveys`, label: 'Surveys' },
		{ href: `/portal/programs/${programId}/team-members`, label: 'Team members' },
	];

	const breadcrumbLinks = [
		{ href: '/', label: 'Home' },
		{ href: `/portal/programs/${programId}/overview`, label: programName },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">{programName}</h1>

				<CountryBadge country="sierra_leone" />

				<div className="flex items-center gap-2">
					<Badge variant={isOperator ? 'default' : 'secondary'} className="text-xs font-medium">
						{isOperator ? 'Editable' : 'Read-only'}
					</Badge>
				</div>

				<Button
					variant="outline"
					className="ml-auto rounded-full"
					disabled={!isOperator}
					title={isOperator ? 'Manage program' : 'You do not have permission to manage this program'}
					aria-disabled={!isOperator}
				>
					<Pen className="mr-2 h-4 w-4" />
					Manage program
				</Button>
			</div>

			<TabNavigation sections={sections} />

			<Card>
				<div>{children}</div>
			</Card>
		</>
	);
}
