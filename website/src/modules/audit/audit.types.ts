import type { AuditChange } from '@/lib/audit/audit-types';

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
	/** Latest name of the entity, also for deleted ones. */
	entityName: string | null;
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

/** Entity types whose edit dialogs show their audit log. */
export const entityAuditTypes = [
	'recipient',
	'payout',
	'contributor',
	'contribution',
	'campaign',
	'survey',
	'expense',
	'country',
	'focus',
	'local-partner',
	'mobile-money-provider',
	'program',
	'organization',
	'user',
] as const;

export type EntityAuditType = (typeof entityAuditTypes)[number];
