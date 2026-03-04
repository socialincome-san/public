'use client';

import { makeContributionsColumns } from '@/components/data-table/columns/contributions';
import DataTable from '@/components/data-table/data-table';
import type { ContributionTableViewRow } from '@/lib/services/contribution/contribution.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { ContributionFormDialog } from './contributions-form-dialog';

export const ContributionsTableClient = ({
	rows,
	error,
	readOnly,
}: {
	rows: ContributionTableViewRow[];
	error: string | null;
	readOnly: boolean;
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
			<DataTable
				title="Contributions"
				error={error}
				emptyMessage="No contributions found"
				data={rows}
				makeColumns={makeContributionsColumns}
				actionMenuItems={[
					{
						label: 'Add contribution',
						icon: <PlusIcon />,
						disabled: readOnly,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
				searchKeys={['firstName', 'lastName', 'email', 'campaignTitle', 'programName']}
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
