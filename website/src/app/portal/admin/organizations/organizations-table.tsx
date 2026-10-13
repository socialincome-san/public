'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { organizationsTableConfig } from '@/components/data-table/configs/organizations-table.config';
import { useSearchParamState } from '@/components/data-table/hooks/use-search-param-state';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { OrganizationTableViewRow } from '@/modules/organizations/organization.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
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
	const [organizationId, setOrganizationId] = useSearchParamState('organizationId');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const open = isCreateFormOpen || Boolean(organizationId);

	const openEmptyForm = () => {
		setOrganizationId(undefined);
		setIsCreateFormOpen(true);
	};

	const openEditForm = (row: OrganizationTableViewRow) => {
		setOrganizationId(row.id);
	};

	const onOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setOrganizationId(undefined);
			setIsCreateFormOpen(false);
		}
	};

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
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
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
