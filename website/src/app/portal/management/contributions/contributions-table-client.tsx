'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	contributionsTableConfig,
	getContributionsTableFilters,
} from '@/components/data-table/configs/contributions-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import { TableQueryState } from '@/components/data-table/query-state';
import type { ContributionFilterOptions, ContributionTableViewRow } from '@/modules/contributions/contribution.types';
import { PlusIcon } from 'lucide-react';
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
	const { recordId: contributionId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('contributionId');

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
						onSelect: openCreate,
					},
				]}
				onRowClick={(row) => openRecord(row.id)}
			/>

			<ContributionFormDialog open={open} onOpenChange={onOpenChange} contributionId={contributionId} />
		</>
	);
};
