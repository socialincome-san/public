'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { organizationsTableConfig } from '@/components/data-table/configs/organizations-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { OrganizationTableViewRow } from '@/modules/organizations/organization.types';
import { PlusIcon } from 'lucide-react';
import { OrganizationDialog } from './organization-dialog';

export default function OrganizationsTable({
	rows,
	error,
	query,
}: {
	rows: OrganizationTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const { recordId: organizationId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('organizationId');

	return (
		<>
			<ConfiguredDataTableClient
				config={organizationsTableConfig}
				titleInfoTooltip="Shows all organizations visible in admin scope."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: 'Add organization',
						icon: <PlusIcon />,
						onSelect: openCreate,
					},
				]}
				onRowClick={(row) => openRecord(row.id)}
			/>

			<OrganizationDialog
				key={organizationId ?? 'new'}
				open={open}
				onOpenChange={onOpenChange}
				organizationId={organizationId}
			/>
		</>
	);
}
