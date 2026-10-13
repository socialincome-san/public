import type { AuditAction, AuditActorType, AuditChange, AuditMetadata, AuditSource } from '@/lib/audit/audit-types';

/** Entity types with an audit trail. Each needs an authorizer in `audit.service.ts`. */
export const AUDITED_ENTITY_TYPES = ['recipient'] as const;

export type AuditedEntityType = (typeof AUDITED_ENTITY_TYPES)[number];

export type AuditEventView = {
	id: string;
	occurredAt: Date;
	actor: {
		type: AuditActorType;
		id: string;
	};
	entity: {
		type: AuditedEntityType;
		id: string;
	};
	action: AuditAction;
	source: AuditSource;
	changes: AuditChange[];
	metadata: AuditMetadata | null;
};

export type AuditTrailPage = {
	events: AuditEventView[];
	nextCursor: string | null;
};

export type AuditTrailFilter = {
	entityType: AuditedEntityType;
	entityId: string;
	actorType?: AuditActorType;
	actorId?: string;
	action?: AuditAction;
	from?: Date;
	to?: Date;
};
