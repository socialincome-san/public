'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { organizationMembersTableConfig } from '@/components/data-table/configs/organization-members-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { OrganizationMemberTableViewRow } from '@/lib/services/organization/organization.types';

type MembersTableProps = {
	rows: OrganizationMemberTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
};

export default function MembersTable({ rows, error, query }: MembersTableProps) {
	return (
		<ConfiguredDataTableClient
			config={organizationMembersTableConfig}
			titleInfoTooltip="Shows members of your active organization."
			rows={rows}
			error={error}
			query={query}
		/>
	);
}
