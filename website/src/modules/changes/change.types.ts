import type { AuditChange } from '@/lib/audit/audit-types';

/** An entity whose changes a user may see, as the owning module describes it. */
export type ChangeLogEntity = {
	id: string;
	name: string;
	/** Where it belongs, e.g. a recipient's program. */
	context: string;
};

export type ChangeTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	entityType?: string;
};

export type ChangeTableViewRow = {
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

export type ChangeTableView = {
	tableRows: ChangeTableViewRow[];
	totalCount: number;
	entityTypeFilterOptions: { value: string; label: string }[];
};
