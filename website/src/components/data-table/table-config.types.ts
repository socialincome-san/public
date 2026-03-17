import { TableQueryState } from '@/components/data-table/query-state';
import { Translator } from '@/lib/i18n/translator';
import type { ColumnDef, SortingState } from '@tanstack/react-table';

export type TableFilterOption = {
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

export type DataTableConfig<Row> = {
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
	showEntityIdColumn?: boolean;
	showRowsPerPageSelector?: boolean;
	pageSizeOptions?: number[];
};
