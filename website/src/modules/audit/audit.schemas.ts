import { tableQuerySchema } from '@/lib/table-query-schema';
import { z } from 'zod';
import { entityAuditTypes } from './audit.types';

export const entityAuditTableQuerySchema = tableQuerySchema.extend({
	entityType: z.enum(entityAuditTypes),
	entityId: z.string().trim().min(1),
});

export type EntityAuditTableQuery = z.infer<typeof entityAuditTableQuerySchema>;
