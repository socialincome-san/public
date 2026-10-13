import { resultFail, resultOk, type Result } from '@/lib/result';
import type { Session } from '@/modules/auth/auth.types';
import { authorizeRecipientAuditTrail } from '@/modules/recipients/recipient.service';
import * as auditRepository from './audit.repository';
import { auditEventRowSchema, auditTrailQuerySchema, type AuditTrailQuery } from './audit.schemas';
import type { AuditedEntityType, AuditEventView } from './audit.types';

// The owning module decides who may read an entity's trail, usually whoever
// may read the entity itself. The Record makes a new entity type fail to
// compile until it has an authorizer.
const authorizeEntityAuditTrail: Record<AuditedEntityType, (session: Session, entityId: string) => Promise<Result<void>>> = {
	recipient: authorizeRecipientAuditTrail,
};

/** Newest events of one entity, for whoever may read the entity. */
export const getAuditTrail = async (session: Session, query: AuditTrailQuery): Promise<Result<AuditEventView[]>> => {
	const queryResult = auditTrailQuerySchema.safeParse(query);
	if (!queryResult.success) {
		return resultFail('Invalid audit trail query.');
	}

	const { entityType, entityId, limit } = queryResult.data;

	try {
		const accessResult = await authorizeEntityAuditTrail[entityType](session, entityId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const rows = await auditRepository.findAuditEvents(entityType, entityId, limit);
		const events: AuditEventView[] = [];
		for (const row of rows) {
			const parsedRow = auditEventRowSchema.safeParse(row);
			if (!parsedRow.success) {
				console.error('Stored audit event does not match its schema', { eventId: row.id });

				return resultFail('Could not read audit trail');
			}

			const { actorType, actorId, entityType, entityId, ...event } = parsedRow.data;
			events.push({
				...event,
				actor: { type: actorType, id: actorId },
				entity: { type: entityType, id: entityId },
			});
		}

		return resultOk(events);
	} catch (error) {
		console.error('Could not read audit trail', { error });

		return resultFail('Could not read audit trail');
	}
};
