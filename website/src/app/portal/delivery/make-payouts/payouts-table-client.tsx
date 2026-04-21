'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getPayoutsTableFilters, payoutsTableConfig } from '@/components/data-table/configs/payouts-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
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
		setIsPayoutFormOpen(true);
	};

	const openEditForm = (row: PayoutTableViewRow) => {
		setPayoutId(row.id);
		setIsPayoutFormOpen(true);
	};

	const handlePayoutFormClose = (open: boolean) => {
		setIsPayoutFormOpen(open);
		if (!open) {
			setPayoutId(undefined);
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

			<PayoutFormDialog open={isPayoutFormOpen} onOpenChange={handlePayoutFormClose} payoutId={payoutId} />

			<StartPayoutProcessDialog open={isPayoutProcessDialogOpen} setOpen={setIsPayoutProcessDialogOpen} />
		</>
	);
};
