import { diffVersions } from '@/lib/audit/audit-diff';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { getRecipientsForChangeLog } from '@/modules/recipients/recipient.service';
import * as changeRepository from './change.repository';
import type { ChangeLogEntity, ChangeTableQuery, ChangeTableView, ChangeTableViewRow } from './change.types';

// Each versioned entity type lists what a user may see of it. A new type
// only needs an entry here.
const changeLogSources: Record<string, { label: string; load: (userId: string) => Promise<Result<ChangeLogEntity[]>> }> = {
	recipient: { label: 'Recipient', load: getRecipientsForChangeLog },
};

/** All changes the user may see, newest first, computed from stored versions. */
export const getChangeTableView = async (userId: string, query: ChangeTableQuery): Promise<Result<ChangeTableView>> => {
	try {
		const search = query.search.trim().toLowerCase();
		const sources = Object.entries(changeLogSources).filter(
			([entityType]) => !query.entityType || entityType === query.entityType,
		);
		const entityTypeFilterOptions = Object.entries(changeLogSources).map(([value, { label }]) => ({ value, label }));

		const entitiesByType = new Map<string, Map<string, ChangeLogEntity>>();
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

		const { versions, totalCount } = await changeRepository.findVersionPage({
			scopes,
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		});
		// The previous version of a row can be on another page, so load the full
		// history of the entities on this one.
		const history = await changeRepository.findVersionHistory(
			[...new Set(versions.map(({ entityType }) => entityType))].map((entityType) => ({
				entityType,
				entityIds: [
					...new Set(versions.filter((version) => version.entityType === entityType).map(({ entityId }) => entityId)),
				],
			})),
		);

		const tableRows = versions.map((version): ChangeTableViewRow => {
			const entity = entitiesByType.get(version.entityType)?.get(version.entityId);
			const entityHistory = history.filter(
				({ entityType, entityId }) => entityType === version.entityType && entityId === version.entityId,
			);
			const previous = entityHistory[entityHistory.findIndex(({ id }) => id === version.id) - 1];

			return {
				id: version.id,
				createdAt: version.createdAt,
				entityType: version.entityType,
				entityTypeLabel: changeLogSources[version.entityType]?.label ?? version.entityType,
				entityId: version.entityId,
				entityName: entity?.name ?? version.entityId,
				context: entity?.context ?? '',
				action: version.action,
				// Self-updates from the app are made by the entity itself.
				actorName:
					version.actorName ?? (version.actorType === version.entityType ? (entity?.name ?? '') : version.actorType),
				source: version.source,
				// Entities created before versioning have no previous version; their
				// first one would list every field, so it shows no changes instead.
				changes: previous || version.action !== 'update' ? diffVersions(previous?.snapshot ?? null, version.snapshot) : [],
			};
		});

		return resultOk({ tableRows, totalCount, entityTypeFilterOptions });
	} catch (error) {
		console.error('Could not fetch changes', { userId, error });

		return resultFail('Could not fetch changes');
	}
};
