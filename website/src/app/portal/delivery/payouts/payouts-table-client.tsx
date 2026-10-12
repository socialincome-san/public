'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getPayoutsTableFilters, payoutsTableConfig } from '@/components/data-table/configs/payouts-table.config';
import { useSearchParamState } from '@/components/data-table/hooks/use-search-param-state';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { PayoutTableViewRow } from '@/modules/payouts/payout.types';
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
	recipientFilterOptions,
}: {
	rows: PayoutTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	programFilterOptions: { id: string; name: string }[];
	statusFilterOptions: { value: string; label: string }[];
	mobileMoneyProviderFilterOptions: { id: string; name: string }[];
	recipientFilterOptions: { id: string; name: string }[];
}) => {
	const [payoutId, setPayoutId] = useSearchParamState('payoutId');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const toolbarFilters = getPayoutsTableFilters({
		query,
		filterOptions: {
			programs: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
			statuses: statusFilterOptions,
			mobileMoneyProviders: mobileMoneyProviderFilterOptions.map((provider) => ({
				value: provider.id,
				label: provider.name,
			})),
			recipients: recipientFilterOptions.map((recipient) => ({ value: recipient.id, label: recipient.name })),
		},
	});

	const openEmptyForm = () => {
		setPayoutId(undefined);
		setIsCreateFormOpen(true);
	};

	const openEditForm = (row: PayoutTableViewRow) => setPayoutId(row.id);

	const handlePayoutFormClose = (open: boolean) => {
		if (!open) {
			setIsCreateFormOpen(false);
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

			<PayoutFormDialog
				open={isCreateFormOpen || payoutId !== undefined}
				onOpenChange={handlePayoutFormClose}
				payoutId={payoutId}
			/>
		</>
	);
};
