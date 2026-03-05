'use client';

import DataTable from '@/components/data-table/data-table';
import { useTableQueryNavigation } from '@/components/data-table/hooks/use-table-query-navigation';
import { TableQueryState } from '@/components/data-table/query-state';
import { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { ActionMenuItem } from '../elements/action-menu';

type ConfiguredDataTableClientProps<Row> = {
	config: DataTableConfig<Row>;
	rows: Row[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	toolbarFilters?: TableFilterConfig[];
	actionMenuItems?: ActionMenuItem[];
	onRowClick?: (row: Row) => void;
	hideProgramName?: boolean;
	hideLocalPartner?: boolean;
	showEntityIdColumn?: boolean;
	isLoading?: boolean;
	lang?: WebsiteLanguage;
};

export const ConfiguredDataTableClient = <Row,>({
	config,
	rows,
	error,
	query,
	toolbarFilters = [],
	actionMenuItems,
	onRowClick,
	hideProgramName = false,
	hideLocalPartner = false,
	showEntityIdColumn,
	isLoading = false,
	lang,
}: ConfiguredDataTableClientProps<Row>) => {
	const { isPending, updateQuery } = useTableQueryNavigation();

	const handleQueryChange = (
		patch: Partial<TableQueryState>,
		options?: {
			debounceMs?: number;
		},
	) => {
		updateQuery(patch, options);
	};

	return (
		<DataTable
			title={config.title}
			error={error}
			emptyMessage={config.emptyMessage}
			data={rows}
			makeColumns={config.makeColumns}
			lang={lang}
			hideProgramName={hideProgramName}
			hideLocalPartner={hideLocalPartner}
			actionMenuItems={actionMenuItems}
			onRowClick={onRowClick}
			initialSorting={config.initialSorting}
			searchKeys={config.searchKeys}
			sortOptions={config.sortOptions}
			query={query}
			onQueryChange={query ? handleQueryChange : undefined}
			showColumnVisibilitySelector={config.showColumnVisibilitySelector}
			showEntityIdColumn={showEntityIdColumn ?? config.showEntityIdColumn}
			showRowsPerPageSelector={config.showRowsPerPageSelector}
			pageSizeOptions={config.pageSizeOptions}
			isLoading={isLoading || isPending}
			toolbarFilters={toolbarFilters}
		/>
	);
};
