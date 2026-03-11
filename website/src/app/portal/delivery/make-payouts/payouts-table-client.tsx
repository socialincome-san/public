'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getPayoutsTableFilters, payoutsTableConfig } from '@/components/data-table/configs/payouts-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { PayoutTableViewRow } from '@/lib/services/payout/payout.types';
import { CircleDollarSignIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { PayoutFormDialog } from './payout-form-dialog';
import { StartPayoutProcessDialog } from './start-payout-process-dialog';

export const PayoutsTableClient = ({
	rows,
	error,
	query,
	programFilterOptions,
	statusFilterOptions,
}: {
	rows: PayoutTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	programFilterOptions: { id: string; name: string }[];
	statusFilterOptions: { value: string; label: string }[];
}) => {
	const [isPayoutFormOpen, setIsPayoutFormOpen] = useState(false);
	const [payoutId, setPayoutId] = useState<string | undefined>(undefined);
	const [readOnly, setReadOnly] = useState(false);
	const [isPayoutProcessDialogOpen, setIsPayoutProcessDialogOpen] = useState(false);
	const toolbarFilters = getPayoutsTableFilters({
		query,
		filterOptions: {
			programs: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
			statuses: statusFilterOptions,
		},
	});

	const openEmptyForm = () => {
		setPayoutId(undefined);
		setReadOnly(false);
		setIsPayoutFormOpen(true);
	};

	const openEditForm = (row: PayoutTableViewRow) => {
		setPayoutId(row.id);
		setReadOnly(row.permission === ProgramPermission.owner);
		setIsPayoutFormOpen(true);
	};

	const handlePayoutFormClose = (open: boolean) => {
		setIsPayoutFormOpen(open);
		if (!open) {
			setPayoutId(undefined);
			setReadOnly(false);
		}
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={payoutsTableConfig}
				titleInfoTooltip="Shows all payouts across all payout statuses."
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={toolbarFilters}
				actionMenuItems={[
					{
						label: 'Add manually',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
					{
						label: 'Start payout process',
						icon: <CircleDollarSignIcon />,
						onSelect: () => setIsPayoutProcessDialogOpen(true),
					},
				]}
				onRowClick={openEditForm}
			/>

			<PayoutFormDialog
				open={isPayoutFormOpen}
				onOpenChange={handlePayoutFormClose}
				payoutId={payoutId}
				readOnly={readOnly}
			/>

			<StartPayoutProcessDialog open={isPayoutProcessDialogOpen} setOpen={setIsPayoutProcessDialogOpen} />
		</>
	);
};
