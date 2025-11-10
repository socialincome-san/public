import { makeOrganizationMemberColumns } from '@/app/portal/components/data-table/columns/organization-members';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { OrganizationService } from '@socialincome/shared/src/database/services/organization/organization.service';
import { OrganizationMemberTableViewRow } from '@socialincome/shared/src/database/services/organization/organization.types';

export default async function OrganizationMembersPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new OrganizationService();
	const result = await service.getOrganizationMembersTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: OrganizationMemberTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Organization Members"
			error={error}
			emptyMessage="No members found"
			data={rows}
			makeColumns={makeOrganizationMemberColumns}
		/>
	);
}
