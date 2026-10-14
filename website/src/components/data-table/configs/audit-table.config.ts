import { auditEntityTypeOptions } from '@/components/audit/audit-summary';
import { makeAuditColumns } from '@/components/data-table/columns/audit';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { AuditTableViewRow } from '@/modules/audit/audit.types';
import type { DataTableConfig, TableFilterConfig } from '../table-config.types';

export const auditTableConfig: DataTableConfig<AuditTableViewRow> = {
	id: 'audit',
	title: 'Audit log',
	emptyMessage: 'No audit events found',
	searchKeys: ['entityName', 'entityId', 'actorName'],
	makeColumns: makeAuditColumns,
};

export const getAuditTableFilters = (query?: TableQueryState): TableFilterConfig[] =>
	query
		? [
				{
					id: 'entityType',
					queryKey: 'entityType',
					label: 'Type',
					placeholder: 'All types',
					value: query.entityType,
					options: auditEntityTypeOptions,
				},
			]
		: [];
