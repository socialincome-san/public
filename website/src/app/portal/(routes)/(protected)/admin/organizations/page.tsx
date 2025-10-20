import { Button } from '@/app/portal/components/button';
import { makeOrganizationColumns } from '@/app/portal/components/data-table/columns/organizations';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { OrganizationService } from '@socialincome/shared/src/database/services/organization/organization.service';
import type { OrganizationTableViewRow } from '@socialincome/shared/src/database/services/organization/organization.types';

export default async function OrganizationsPage() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new OrganizationService();
	const result = await service.getOrganizationAdminTableView(user);

	const error = result.success ? null : result.error;
	const rows: OrganizationTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Organizations"
			error={error}
			emptyMessage="No organizations found"
			data={rows}
			makeColumns={makeOrganizationColumns}
			actions={<Button>Create organization</Button>}
		/>
	);
}
