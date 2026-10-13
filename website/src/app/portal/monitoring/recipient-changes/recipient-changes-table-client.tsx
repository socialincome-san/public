'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getRecipientChangesTableFilters,
	recipientChangesTableConfig,
} from '@/components/data-table/configs/recipient-changes-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { RecipientChangeTableView } from '@/modules/recipients/recipient.types';

export const RecipientChangesTableClient = ({
	view,
	error,
	query,
}: {
	view: RecipientChangeTableView;
	error: string | null;
	query: TableQueryState & { totalRows: number };
}) => (
	<ConfiguredDataTableClient
		config={recipientChangesTableConfig}
		titleInfoTooltip="Changes to recipients in programs you operate."
		rows={view.tableRows}
		error={error}
		query={query}
		toolbarFilters={getRecipientChangesTableFilters({
			query,
			programs: view.programFilterOptions.map(({ id, name }) => ({ value: id, label: name })),
			recipients: view.recipientFilterOptions.map(({ id, name }) => ({ value: id, label: name })),
		})}
	/>
);
