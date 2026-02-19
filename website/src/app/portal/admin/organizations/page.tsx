import { makeOrganizationAdminColumns } from '@/components/data-table/columns/organizations';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { OrganizationService } from '@/lib/services/organization/organization.service';
import type { OrganizationTableViewRow } from '@/lib/services/organization/organization.types';
import { Suspense } from 'react';

export default function OrganizationsPage() {
  return (
    <Suspense>
      <OrganizationsDataLoader />
    </Suspense>
  );
}

const OrganizationsDataLoader = async () => {
  const user = await getAuthenticatedUserOrRedirect();
  await requireAdmin(user);

  const service = new OrganizationService();
  const result = await service.getAdminTableView(user.id);

  const error = result.success ? null : result.error;
  const rows: OrganizationTableViewRow[] = result.success ? result.data.tableRows : [];

  return (
    <DataTable
      title="All Organizations"
      error={error}
      emptyMessage="No organizations found"
      data={rows}
      makeColumns={makeOrganizationAdminColumns}
    />
  );
};
