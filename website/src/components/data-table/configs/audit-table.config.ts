import { makeAuditColumns } from '@/components/data-table/columns/audit';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { AuditTableViewRow } from '@/modules/audit/audit.types';
import type { DataTableConfig, TableFilterConfig } from '../table-config.types';

export const auditTableConfig: DataTableConfig<AuditTableViewRow> = {
	id: 'audit',
	title: 'Audit log',
	emptyMessage: 'No audit events found',
	searchKeys: ['entityId', 'entityName'],
	makeColumns: makeAuditColumns,
};

export const getAuditTableFilters = ({
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
