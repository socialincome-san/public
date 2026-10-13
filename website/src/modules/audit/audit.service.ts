import { diffSnapshots } from '@/lib/audit/audit-diff';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { getRecipientsForAuditLog } from '@/modules/recipients/recipient.service';
import * as auditRepository from './audit.repository';
import type { AuditLogEntity, AuditTableQuery, AuditTableView, AuditTableViewRow } from './audit.types';

// Each audited entity type lists what a user may see of it. A new type
// only needs an entry here.
const auditLogSources: Record<string, { label: string; load: (userId: string) => Promise<Result<AuditLogEntity[]>> }> = {
	recipient: { label: 'Recipient', load: getRecipientsForAuditLog },
};

/** All audit events the user may see, newest first, each diffed against the previous one. */
export const getAuditTableView = async (userId: string, query: AuditTableQuery): Promise<Result<AuditTableView>> => {
	try {
		const search = query.search.trim().toLowerCase();
		const sources = Object.entries(auditLogSources).filter(
			([entityType]) => !query.entityType || entityType === query.entityType,
		);
		const entityTypeFilterOptions = Object.entries(auditLogSources).map(([value, { label }]) => ({ value, label }));

		const entitiesByType = new Map<string, Map<string, AuditLogEntity>>();
		for (const [entityType, { load }] of sources) {
			const entitiesResult = await load(userId);
			if (!entitiesResult.success) {
				return resultFail(entitiesResult.error);
			}
			const entities = entitiesResult.data.filter(
				({ id, name }) => !search || id.toLowerCase().includes(search) || name.toLowerCase().includes(search),
			);
			entitiesByType.set(entityType, new Map(entities.map((entity) => [entity.id, entity])));
		}

		const scopes = [...entitiesByType]
			.map(([entityType, entities]) => ({ entityType, entityIds: [...entities.keys()] }))
			.filter(({ entityIds }) => entityIds.length > 0);
		if (scopes.length === 0) {
			return resultOk({ tableRows: [], totalCount: 0, entityTypeFilterOptions });
		}

		const { events, totalCount } = await auditRepository.findAuditEventPage({
			scopes,
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		});
		// The previous event of a row can be on another page, so load the full
		// history of the entities on this one.
		const history = await auditRepository.findAuditEventHistory(
			[...new Set(events.map(({ entityType }) => entityType))].map((entityType) => ({
				entityType,
				entityIds: [...new Set(events.filter((event) => event.entityType === entityType).map(({ entityId }) => entityId))],
			})),
		);

		const tableRows = events.map((event): AuditTableViewRow => {
			const entity = entitiesByType.get(event.entityType)?.get(event.entityId);
			const entityHistory = history.filter(
				({ entityType, entityId }) => entityType === event.entityType && entityId === event.entityId,
			);
			const previous = entityHistory[entityHistory.findIndex(({ id }) => id === event.id) - 1];

			return {
				id: event.id,
				createdAt: event.createdAt,
				entityType: event.entityType,
				entityTypeLabel: auditLogSources[event.entityType]?.label ?? event.entityType,
				entityId: event.entityId,
				entityName: entity?.name ?? event.entityId,
				context: entity?.context ?? '',
				action: event.action,
				// Self-updates from the app are made by the entity itself.
				actorName: event.actorName ?? (event.actorType === event.entityType ? (entity?.name ?? '') : event.actorType),
				source: event.source,
				// Entities created before auditing have no previous event; their
				// first one would list every field, so it shows no changes instead.
				changes: previous || event.action !== 'update' ? diffSnapshots(previous?.snapshot ?? null, event.snapshot) : [],
			};
		});

		return resultOk({ tableRows, totalCount, entityTypeFilterOptions });
	} catch (error) {
		console.error('Could not fetch audit events', { userId, error });

		return resultFail('Could not fetch audit events');
	}
};
