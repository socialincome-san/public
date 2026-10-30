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
	makeColumns: () => makeAuditColumns(),
};

export const entityAuditTableConfig: DataTableConfig<AuditTableViewRow> = {
	...auditTableConfig,
	id: 'entity-audit',
	searchKeys: [],
	makeColumns: () => makeAuditColumns({ hideEntity: true }),
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
				{
					id: 'paymentPhone',
					queryKey: 'paymentPhone',
					label: 'Payment phone',
					placeholder: 'Search payment phone',
					type: 'text',
					value: query.paymentPhone,
					options: [],
				},
				{
					id: 'contactPhone',
					queryKey: 'contactPhone',
					label: 'Contact phone',
					placeholder: 'Search contact phone',
					type: 'text',
					value: query.contactPhone,
					options: [],
				},
				{
					id: 'firstName',
					queryKey: 'firstName',
					label: 'First name',
					placeholder: 'Search first name',
					type: 'text',
					value: query.firstName,
					options: [],
				},
				{
					id: 'lastName',
					queryKey: 'lastName',
					label: 'Last name',
					placeholder: 'Search last name',
					type: 'text',
					value: query.lastName,
					options: [],
				},
			]
		: [];
