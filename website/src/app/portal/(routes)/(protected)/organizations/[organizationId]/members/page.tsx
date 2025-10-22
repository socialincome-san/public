import { Button } from '@/app/portal/components/button';
import { makeOrganizationMembersColumns } from '@/app/portal/components/data-table/columns/organization-members';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import type { OrganizationMembersTableViewRow } from '@socialincome/shared/src/database/services/user/user.types';

type Props = { params: Promise<{ organizationId: string }> };

export default async function OrganizationMembersPage({ params }: Props) {
	const user = await getAuthenticatedUserOrRedirect();
	const { organizationId } = await params;

	const service = new UserService();
	const result = await service.getOrganizationMembersTableView(user.id, organizationId);

	const error = result.success ? null : result.error;
	const rows: OrganizationMembersTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Organization Members"
			error={error}
			emptyMessage="No members found"
			data={rows}
			makeColumns={makeOrganizationMembersColumns}
			actions={<Button>Add member</Button>}
		/>
	);
}
