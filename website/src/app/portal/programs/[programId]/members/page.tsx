import { makeProgramMembersColumns } from '@/components/data-table/columns/program-members';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { OrganizationMemberTableViewRow } from '@/lib/services/organization/organization.types';
import { ProgramService } from '@/lib/services/program/program.service';
import { Suspense } from 'react';

type Props = { params: Promise<{ programId: string }> };

export default function ProgramMembersPage({ params }: Props) {
	return (
		<Suspense>
			<ProgramMembersDataLoader params={params} />
		</Suspense>
	);
}

async function ProgramMembersDataLoader({ params }: { params: Promise<{ programId: string }> }) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const programService = new ProgramService();
	const membersResult = await programService.getMembersTableView(user.id, programId);

	const error = membersResult.success ? null : membersResult.error;
	const rows: OrganizationMemberTableViewRow[] = membersResult.success ? membersResult.data.tableRows : [];

	return (
		<DataTable
			title="Program Members"
			error={error}
			emptyMessage="No members found"
			data={rows}
			makeColumns={makeProgramMembersColumns}
		/>
	);
}
