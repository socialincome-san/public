import { makeFocusColumns } from '@/components/data-table/columns/focuses';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { FocusTableViewRow } from '@/lib/services/focus/focus.types';

export const focusesTableConfig: DataTableConfig<FocusTableViewRow> = {
	id: 'admin-focuses',
	title: 'Focuses',
	emptyMessage: 'No focuses found',
	searchKeys: ['id', 'name'],
	sortOptions: [
		{ id: 'name', label: 'Name' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeFocusColumns,
	showColumnVisibilitySelector: true,
};
