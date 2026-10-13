'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { changesTableConfig, getChangesTableFilters } from '@/components/data-table/configs/changes-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { ChangeTableView } from '@/modules/changes/change.types';

export const ChangesTableClient = ({
	view,
	error,
	query,
}: {
	view: ChangeTableView;
	error: string | null;
	query: TableQueryState & { totalRows: number };
}) => (
	<ConfiguredDataTableClient
		config={changesTableConfig}
		titleInfoTooltip="Changes to everything you may see, such as recipients in programs you operate."
		rows={view.tableRows}
		error={error}
		query={query}
		toolbarFilters={getChangesTableFilters({ query, entityTypes: view.entityTypeFilterOptions })}
	/>
);
