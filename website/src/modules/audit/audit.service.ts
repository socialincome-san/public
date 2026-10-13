import { diffSnapshots } from '@/lib/audit/audit-diff';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { isAdmin } from '@/modules/users/user.service';
import * as auditRepository from './audit.repository';
import type { AuditTableQuery, AuditTableView, AuditTableViewRow } from './audit.types';

/** Every audit event, newest first, each diffed against the entity's previous one. Admins only. */
export const getAuditTableView = async (userId: string, query: AuditTableQuery): Promise<Result<AuditTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { events, totalCount } = await auditRepository.findAuditEventPage({
			entityType: query.entityType,
			search: query.search.trim(),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		});
		if (events.length === 0) {
			return resultOk({ tableRows: [], totalCount });
		}

		// The previous event of a row can be on another page, so load the full
		// history of the entities on this one.
		const history = await auditRepository.findAuditEventHistory([
			...new Map(events.map(({ entityType, entityId }) => [`${entityType}:${entityId}`, { entityType, entityId }])).values(),
		]);

		const tableRows = events.map((event): AuditTableViewRow => {
			const entityHistory = history.filter(
				({ entityType, entityId }) => entityType === event.entityType && entityId === event.entityId,
			);
			const previous = entityHistory[entityHistory.findIndex(({ id }) => id === event.id) - 1];

			return {
				id: event.id,
				createdAt: event.createdAt,
				entityType: event.entityType,
				entityId: event.entityId,
				latestSnapshot: entityHistory.findLast(({ snapshot }) => snapshot !== null)?.snapshot ?? null,
				action: event.action,
				actorType: event.actorType,
				actorName: event.actorName,
				source: event.source,
				// Entities created before auditing have no previous event; their
				// first one would list every field, so it shows no changes instead.
				changes: previous || event.action !== 'update' ? diffSnapshots(previous?.snapshot ?? null, event.snapshot) : [],
			};
		});

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch audit events', { userId, error });

		return resultFail('Could not fetch audit events');
	}
};
