import type { AuditChange, JsonValue } from '@/lib/audit/audit-types';

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
	entityId: string;
	/** Most recent snapshot of the entity, also for deleted ones; the entity name is read from it. */
	latestSnapshot: JsonValue;
	action: string;
	actorType: string;
	actorName: string | null;
	source: string;
	changes: AuditChange[];
};

export type AuditTableView = {
	tableRows: AuditTableViewRow[];
	totalCount: number;
};
