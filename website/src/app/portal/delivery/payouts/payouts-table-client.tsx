'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getPayoutsTableFilters, payoutsTableConfig } from '@/components/data-table/configs/payouts-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { PayoutTableViewRow } from '@/lib/services/payout/payout.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { PayoutFormDialog } from './payout-form-dialog';

export const PayoutsTableClient = ({
	rows,
	error,
	query,
	programFilterOptions,
	statusFilterOptions,
	mobileMoneyProviderFilterOptions,
}: {
	rows: PayoutTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	programFilterOptions: { id: string; name: string }[];
	statusFilterOptions: { value: string; label: string }[];
	mobileMoneyProviderFilterOptions: { id: string; name: string }[];
}) => {
	const [isPayoutFormOpen, setIsPayoutFormOpen] = useState(false);
	const [payoutId, setPayoutId] = useState<string | undefined>(undefined);
	const toolbarFilters = getPayoutsTableFilters({
		query,
		filterOptions: {
			programs: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
			statuses: statusFilterOptions,
			mobileMoneyProviders: mobileMoneyProviderFilterOptions.map((provider) => ({
				value: provider.id,
				label: provider.name,
			})),
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
				]}
				onRowClick={openEditForm}
			/>

			<PayoutFormDialog open={isPayoutFormOpen} onOpenChange={handlePayoutFormClose} payoutId={payoutId} />
		</>
	);
};
