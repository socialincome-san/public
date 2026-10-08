import { TableQueryState } from '@/components/data-table/query-state';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { RowData, SortingState } from '@tanstack/react-table';
import { type useTranslations } from 'next-intl';

export type DataTableTranslator = ReturnType<typeof useTranslations<'website-me'>>;

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
	makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean, t?: DataTableTranslator) => ColumnDef<Row>[];
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
