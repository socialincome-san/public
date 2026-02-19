import { makeOrganizationMemberColumns } from '@/components/data-table/columns/organization-members';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { OrganizationService } from '@/lib/services/organization/organization.service';
import { OrganizationMemberTableViewRow } from '@/lib/services/organization/organization.types';
import { Suspense } from 'react';

export default function OrganizationMembersPage() {
  return (
    <Suspense>
      <OrganizationMembersDataLoader />
    </Suspense>
  );
}

const OrganizationMembersDataLoader = async () => {
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
};
