import { ProgramPermission } from '@/generated/prisma/enums';
import { diffSnapshots } from '@/lib/audit/audit-diff';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { getCampaignFilterOption } from '@/modules/campaigns/campaign.service';
import { getContribution } from '@/modules/contributions/contribution.service';
import { getContributor } from '@/modules/contributors/contributor.service';
import { getCountry } from '@/modules/countries/country.service';
import { getExpense } from '@/modules/expenses/expense.service';
import { getFocus } from '@/modules/focuses/focus.service';
import { getLocalPartner } from '@/modules/local-partners/local-partner.service';
import { getMobileMoneyProvider } from '@/modules/mobile-money-providers/mobile-money-provider.service';
import { getOrganization } from '@/modules/organizations/organization.service';
import { getPayout } from '@/modules/payouts/payout.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import { getProgramSettings } from '@/modules/programs/program.service';
import { getRecipientById } from '@/modules/recipients/recipient.service';
import { getSurvey } from '@/modules/surveys/survey.service';
import { getUser, isAdmin } from '@/modules/users/user.service';
import type { UserSession } from '@/modules/users/user.types';
import * as auditRepository from './audit.repository';
import type { EntityAuditTableQuery } from './audit.schemas';
import type { AuditTableQuery, AuditTableView, AuditTableViewRow, EntityAuditType } from './audit.types';

type AuditEvent = Awaited<ReturnType<typeof auditRepository.findAuditEventHistory>>[number];

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
		const tableRows = events.map((event) =>
			toTableRow(
				event,
				history.filter(({ entityType, entityId }) => entityType === event.entityType && entityId === event.entityId),
			),
		);

		return resultOk({ tableRows, totalCount });
	} catch (error) {
		console.error('Could not fetch audit events', { userId, error });

		return resultFail('Could not fetch audit events');
	}
};

// Whoever may open an entity may read its audit log.
const readEntity: Record<EntityAuditType, (session: UserSession, entityId: string) => Promise<Result<unknown>>> = {
	recipient: getRecipientById,
	payout: (session, id) => getPayout(session.id, id),
	contributor: (session, id) => getContributor(session.id, id),
	contribution: (session, id) => getContribution(session.id, id),
	campaign: async (session, id) => {
		const accessResult = await getAccessiblePrograms(session.id);
		if (!accessResult.success) {
			return accessResult;
		}
		const programIds = accessResult.data
			.filter(({ permission }) => permission === ProgramPermission.operator)
			.map(({ programId }) => programId);
		const campaignResult = await getCampaignFilterOption(id, programIds);
		if (!campaignResult.success) {
			return campaignResult;
		}

		return campaignResult.data ? campaignResult : resultFail('Permission denied');
	},
	survey: (session, id) => getSurvey(session.id, id),
	expense: (session, id) => getExpense(session.id, id),
	country: (session, id) => getCountry(session.id, id),
	focus: (session, id) => getFocus(session.id, id),
	'local-partner': (session, id) => getLocalPartner(session.id, id),
	'mobile-money-provider': (session, id) => getMobileMoneyProvider(session.id, id),
	program: (session, id) => getProgramSettings(session.id, id),
	organization: (session, id) => getOrganization(session.id, id),
	user: (session, id) => getUser(session.id, id),
};

/** The audit events of one entity, newest first, to everyone who may read the entity. */
export const getEntityAuditTableView = async (
	session: UserSession,
	query: EntityAuditTableQuery,
): Promise<Result<AuditTableView>> => {
	try {
		const readResult = await readEntity[query.entityType](session, query.entityId);
		if (!readResult.success) {
			return resultFail(readResult.error);
		}

		const history = await auditRepository.findAuditEventHistory([
			{ entityType: query.entityType, entityId: query.entityId },
		]);
		const skip = (query.page - 1) * query.pageSize;
		const tableRows = history
			.toReversed()
			.slice(skip, skip + query.pageSize)
			.map((event) => toTableRow(event, history));

		return resultOk({ tableRows, totalCount: history.length });
	} catch (error) {
		console.error('Could not fetch entity audit events', {
			userId: session.id,
			entityType: query.entityType,
			entityId: query.entityId,
			error,
		});

		return resultFail('Could not fetch audit events');
	}
};

/** `entityHistory` holds every event of the event's entity, oldest first. */
const toTableRow = (event: AuditEvent, entityHistory: AuditEvent[]): AuditTableViewRow => {
	const previous = entityHistory[entityHistory.findIndex(({ id }) => id === event.id) - 1];

	return {
		id: event.id,
		createdAt: event.createdAt,
		entityType: event.entityType,
		entityId: event.entityId,
		entityName: entityHistory.findLast(({ entityName }) => entityName !== null)?.entityName ?? null,
		action: event.action,
		actorType: event.actorType,
		actorName: event.actorName,
		source: event.source,
		// Entities created before auditing have no previous event; their
		// first one would list every field, so it shows no changes instead.
		changes: previous || event.action !== 'update' ? diffSnapshots(previous?.snapshot ?? null, event.snapshot) : [],
	};
};
