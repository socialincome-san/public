import { Card } from '@/app/portal/components/custom/card';
import { TabNavigation } from '@/app/portal/components/custom/tab-navigation';
import { FlagSierraLeone } from '@/app/portal/components/pro-blocks/flag-sierra-leone';
import { Badge } from '@/app/portal/components/ui/badge';
import { Button } from '@/app/portal/components/ui/button';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

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
	const result = await service.getUserProgramSummary(programId, user.id);

	if (!result.success) {
		return <div className="p-4">Error loading the program</div>;
	}

	const { name, programPermission } = result.data;
	const isOperator = programPermission === 'operator';

	const sections = [
		{ href: `/portal/programs/${programId}/overview`, label: 'Overview' },
		{ href: `/portal/programs/${programId}/recipients`, label: 'Recipients' },
		{ href: `/portal/programs/${programId}/finances`, label: 'Finances' },
		{ href: `/portal/programs/${programId}/fundraising`, label: 'Fundraising' },
		{ href: `/portal/programs/${programId}/surveys`, label: 'Surveys' },
		{ href: `/portal/programs/${programId}/team-members`, label: 'Team members' },
	];

	return (
		<>
			<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
				<h1 className="py-8 text-5xl">{name}</h1>

				<Badge
					variant="outline"
					className="bg-background flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5"
				>
					<FlagSierraLeone />
					<span className="text-foreground text-xs font-medium">Sierra Leone</span>
				</Badge>

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
