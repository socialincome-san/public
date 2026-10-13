import { makeChangeColumns } from '@/components/data-table/columns/changes';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { ChangeTableViewRow } from '@/modules/changes/change.types';
import type { DataTableConfig, TableFilterConfig } from '../table-config.types';

export const changesTableConfig: DataTableConfig<ChangeTableViewRow> = {
	id: 'changes',
	title: 'Changes',
	emptyMessage: 'No changes found',
	searchKeys: ['entityId', 'entityName'],
	makeColumns: makeChangeColumns,
};

export const getChangesTableFilters = ({
	query,
	entityTypes,
}: {
	query?: TableQueryState;
	entityTypes: { value: string; label: string }[];
}): TableFilterConfig[] =>
	query
		? [
				{
					id: 'entityType',
					queryKey: 'entityType',
					label: 'Type',
					placeholder: 'All types',
					value: query.entityType,
					options: entityTypes,
				},
			]
		: [];
