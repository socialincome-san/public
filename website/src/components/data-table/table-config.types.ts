import { TableQueryState } from '@/components/data-table/query-state';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import { Translator } from '@/lib/i18n/translator';
import type { RowData, SortingState } from '@tanstack/react-table';

type TableFilterOption = {
	value: string;
	label: string;
};

export type TableFilterConfig = {
	id: string;
	queryKey: keyof TableQueryState;
	label: string;
	placeholder: string;
	value?: string;
	options: TableFilterOption[];
	hidden?: boolean;
};

export type DataTableConfig<Row extends RowData> = {
	id: string;
	title: string;
	emptyMessage: string;
	searchKeys: (keyof Row)[];
	makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean, translator?: Translator) => ColumnDef<Row>[];
	sortOptions?: {
		id: string;
		label: string;
	}[];
	initialSorting?: SortingState;
	showColumnVisibilitySelector?: boolean;
	showSearchClearButton?: boolean;
	showSearchFields?: boolean;
	showEntityIdColumn?: boolean;
	showRowsPerPageSelector?: boolean;
	pageSizeOptions?: number[];
};
