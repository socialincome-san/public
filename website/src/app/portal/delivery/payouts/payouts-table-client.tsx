'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getPayoutsTableFilters, payoutsTableConfig } from '@/components/data-table/configs/payouts-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { PayoutTableViewRow } from '@/modules/payouts/payout.types';
import { PlusIcon } from 'lucide-react';
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
	const { recordId: payoutId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('payoutId');
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
						onSelect: openCreate,
					},
				]}
				onRowClick={(row) => openRecord(row.id)}
			/>

			<PayoutFormDialog open={open} onOpenChange={onOpenChange} payoutId={payoutId} />
		</>
	);
};
