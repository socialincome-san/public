import { Button } from '@/app/portal/components/button';
import { makeProgramMembersColumns } from '@/app/portal/components/data-table/columns/program-members';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { OrganizationMembersTableViewRow } from '@socialincome/shared/src/database/services/user/user.types';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

type Props = { params: Promise<{ programId: string }> };

export default async function ProgramMembersPage({ params }: Props) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const programService = new ProgramService();
	const membersResult = await programService.getMembersTableView(user.id, programId);

	const error = membersResult.success ? null : membersResult.error;
	const rows: OrganizationMembersTableViewRow[] = membersResult.success ? membersResult.data.tableRows : [];

	return (
		<DataTable
			title="Program Members"
			error={error}
			emptyMessage="No members found"
			data={rows}
			makeColumns={makeProgramMembersColumns}
			actions={<Button>Add member</Button>}
		/>
	);
}
