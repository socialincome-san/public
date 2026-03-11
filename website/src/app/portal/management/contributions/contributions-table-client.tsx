'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	contributionsTableConfig,
	getContributionsTableFilters,
} from '@/components/data-table/configs/contributions-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import type { ContributionTableViewRow } from '@/lib/services/contribution/contribution.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { ContributionFormDialog } from './contributions-form-dialog';

export const ContributionsTableClient = ({
	rows,
	error,
	readOnly,
	query,
	filterOptions,
}: {
	rows: ContributionTableViewRow[];
	error: string | null;
	readOnly: boolean;
	query?: TableQueryState & { totalRows: number };
	filterOptions?: {
		programs: { value: string; label: string }[];
		campaigns: { value: string; label: string }[];
		paymentEventTypes: { value: string; label: string }[];
	};
}) => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [contributionId, setContributionId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setContributionId(undefined);
		setIsFormOpen(true);
	};

	const openEditForm = (row: ContributionTableViewRow) => {
		setContributionId(row.id);
		setIsFormOpen(true);
	};

	const handleClose = (open: boolean) => {
		setIsFormOpen(open);
		if (!open) {
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
					filterOptions: filterOptions ?? { programs: [], campaigns: [], paymentEventTypes: [] },
				})}
				actionMenuItems={[
					{
						label: 'Add contribution',
						icon: <PlusIcon />,
						disabled: readOnly,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<ContributionFormDialog
				readOnly={readOnly}
				open={isFormOpen}
				onOpenChange={handleClose}
				contributionId={contributionId}
			/>
		</>
	);
};
