import type { AuditChange } from '@/lib/audit/audit-types';

/** An entity whose audit events a user may see, as the owning module describes it. */
export type AuditLogEntity = {
	id: string;
	name: string;
	/** Where it belongs, e.g. a recipient's program. */
	context: string;
};

export type AuditTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	entityType?: string;
};

export type AuditTableViewRow = {
	id: string;
	createdAt: Date;
	entityType: string;
	entityTypeLabel: string;
	entityId: string;
	entityName: string;
	context: string;
	action: string;
	actorName: string;
	source: string;
	changes: AuditChange[];
};

export type AuditTableView = {
	tableRows: AuditTableViewRow[];
	totalCount: number;
	entityTypeFilterOptions: { value: string; label: string }[];
};
