'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { auditTableConfig, getAuditTableFilters } from '@/components/data-table/configs/audit-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { AuditTableView } from '@/modules/audit/audit.types';

export const AuditTableClient = ({
	view,
	error,
	query,
}: {
	view: AuditTableView;
	error: string | null;
	query: TableQueryState & { totalRows: number };
}) => (
	<ConfiguredDataTableClient
		config={auditTableConfig}
		titleInfoTooltip="Every recorded change to audited data, newest first."
		rows={view.tableRows}
		error={error}
		query={query}
		toolbarFilters={getAuditTableFilters(query)}
	/>
);
