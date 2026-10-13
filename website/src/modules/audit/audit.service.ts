import { resultFail, resultOk, type Result } from '@/lib/result';
import type { Session } from '@/modules/auth/auth.types';
import { authorizeRecipientAuditTrail } from '@/modules/recipients/recipient.service';
import * as auditRepository from './audit.repository';
import { auditEventRowSchema, auditTrailQuerySchema, type AuditTrailQuery } from './audit.schemas';
import type { AuditedEntityType, AuditEventView, AuditTrailPage } from './audit.types';

// The owning module decides who may read an entity's trail, usually whoever
// may read the entity itself. The Record makes a new entity type fail to
// compile until it has an authorizer.
const authorizeEntityAuditTrail: Record<AuditedEntityType, (session: Session, entityId: string) => Promise<Result<void>>> = {
	recipient: authorizeRecipientAuditTrail,
};

export const getAuditTrail = async (session: Session, query: AuditTrailQuery): Promise<Result<AuditTrailPage>> => {
	const queryResult = auditTrailQuerySchema.safeParse(query);
	if (!queryResult.success) {
		return resultFail('Invalid audit trail query.');
	}

	const { cursor, limit, ...filter } = queryResult.data;
	if (filter.from && filter.to && filter.from > filter.to) {
		return resultFail('Invalid audit trail query.');
	}

	try {
		const accessResult = await authorizeEntityAuditTrail[filter.entityType](session, filter.entityId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const rows = await auditRepository.findAuditEvents({ filter, cursor, take: limit + 1 });
		const events: AuditEventView[] = [];
		for (const row of rows.slice(0, limit)) {
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

		return resultOk({
			events,
			nextCursor: rows.length > limit ? (events.at(-1)?.id ?? null) : null,
		});
	} catch (error) {
		console.error('Could not read audit trail', { error });

		return resultFail('Could not read audit trail');
	}
};
