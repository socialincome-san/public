'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { useLocalTableQuery } from '@/components/data-table/hooks/use-local-table-query';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { Result } from '@/lib/result';
import { useRouter } from 'next/navigation';

type RecordTableTabProps<Row extends { id: string }> = {
	config: DataTableConfig<Row>;
	load: (query: TableQueryState) => Promise<Result<{ tableRows: Row[]; totalCount: number }>>;
	getRowHref?: (row: Row) => string;
};

// Related records of one entity inside a TabbedDialog; the query stays local so the page URL is untouched
export const RecordTableTab = <Row extends { id: string }>({ config, load, getRowHref }: RecordTableTabProps<Row>) => {
	const router = useRouter();
	const { query, rows, error, isLoading, updateQuery } = useLocalTableQuery(load);

	return (
		<ConfiguredDataTableClient
			config={config}
			rows={rows}
			error={error}
			query={query}
			onQueryChange={updateQuery}
			isLoading={isLoading}
			showEntityIdColumn={false}
			onRowClick={getRowHref ? (row) => router.push(getRowHref(row)) : undefined}
		/>
	);
};
