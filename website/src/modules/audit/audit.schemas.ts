import { AUDIT_ACTIONS, AUDIT_ACTOR_TYPES, AUDIT_SOURCES } from '@/lib/audit/audit-types';
import { z } from 'zod';
import { AUDITED_ENTITY_TYPES } from './audit.types';

export const auditTrailQuerySchema = z.object({
	entityType: z.enum(AUDITED_ENTITY_TYPES),
	entityId: z.string().trim().min(1),
	actorType: z.enum(AUDIT_ACTOR_TYPES).optional(),
	actorId: z.string().trim().min(1).optional(),
	action: z.enum(AUDIT_ACTIONS).optional(),
	from: z.coerce.date().optional(),
	to: z.coerce.date().optional(),
	cursor: z.string().trim().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type AuditTrailQuery = z.input<typeof auditTrailQuerySchema>;

export const auditSessionTypeSchema = z.enum(['user', 'local-partner']);

const auditScalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

const auditValueSchema = z.union([auditScalarSchema, z.array(auditScalarSchema)]);

export const auditEventRowSchema = z.object({
	id: z.string(),
	occurredAt: z.date(),
	actorType: z.enum(AUDIT_ACTOR_TYPES),
	actorId: z.string(),
	entityType: z.enum(AUDITED_ENTITY_TYPES),
	entityId: z.string(),
	action: z.enum(AUDIT_ACTIONS),
	source: z.enum(AUDIT_SOURCES),
	changes: z.array(
		z.union([
			z.object({ path: z.string(), redacted: z.literal(true) }),
			z.object({ path: z.string(), old: auditValueSchema, new: auditValueSchema }),
		]),
	),
	metadata: z.record(auditScalarSchema).nullable(),
});
