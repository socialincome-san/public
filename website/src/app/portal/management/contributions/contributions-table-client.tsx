'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	contributionsTableConfig,
	getContributionsTableFilters,
} from '@/components/data-table/configs/contributions-table.config';
import { useSearchParamState } from '@/components/data-table/hooks/use-search-param-state';
import { TableQueryState } from '@/components/data-table/query-state';
import type { ContributionFilterOptions, ContributionTableViewRow } from '@/modules/contributions/contribution.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { ContributionFormDialog } from './contributions-form-dialog';

export const ContributionsTableClient = ({
	rows,
	error,
	query,
	filterOptions,
}: {
	rows: ContributionTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	filterOptions?: ContributionFilterOptions;
}) => {
	const [contributionId, setContributionId] = useSearchParamState('contributionId');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

	const openEmptyForm = () => {
		setContributionId(undefined);
		setIsCreateFormOpen(true);
	};

	const openEditForm = (row: ContributionTableViewRow) => setContributionId(row.id);

	const handleClose = (open: boolean) => {
		if (!open) {
			setIsCreateFormOpen(false);
			setContributionId(undefined);
		}
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={contributionsTableConfig}
				titleInfoTooltip="Shows contributions in your active organization scope."
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={getContributionsTableFilters({
					query,
					filterOptions: filterOptions ?? { programs: [], campaigns: [], paymentEventTypes: [], contributors: [] },
				})}
				actionMenuItems={[
					{
						label: 'Add contribution',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<ContributionFormDialog
				open={isCreateFormOpen || contributionId !== undefined}
				onOpenChange={handleClose}
				contributionId={contributionId}
			/>
		</>
	);
};
