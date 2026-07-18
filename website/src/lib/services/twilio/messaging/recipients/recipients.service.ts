import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import type { ContributorReadService } from '../../../contributor/contributor-read.service';
import { BaseService } from '../../../core/base.service';
import type { LocalPartnerReadService } from '../../../local-partner/local-partner-read.service';
import type { RecipientReadService } from '../../../recipient/recipient-read.service';
import type { MessagingRecipientType } from './recipients.types';
import { resolveSelectionToIds, type RowFetcher } from './resolve-selection';
import type { SelectionState } from './selection.types';

export class MessagingRecipientsService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly contributorRead: ContributorReadService,
		private readonly recipientRead: RecipientReadService,
		private readonly localPartnerRead: LocalPartnerReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private fetcherFor(type: MessagingRecipientType, currentUserId: string): RowFetcher {
		return async (page, pageSize, search, filters) => {
			const query = { page, pageSize, search };
			if (type === 'contributor') {
				const result = await this.contributorRead.getPaginatedTableView(currentUserId, {
					...query,
					country: filters.country,
				});
				if (!result.success) {
					throw new Error(result.error);
				}

				return { ids: result.data.tableRows.map((row) => row.id), totalCount: result.data.totalCount };
			}
			if (type === 'recipient') {
				const result = await this.recipientRead.getPaginatedTableView(currentUserId, {
					...query,
					programId: filters.programId,
					recipientStatus: filters.recipientStatus,
				});
				if (!result.success) {
					throw new Error(result.error);
				}

				return { ids: result.data.tableRows.map((row) => row.id), totalCount: result.data.totalCount };
			}
			const result = await this.localPartnerRead.getPaginatedTableView(currentUserId, query);
			if (!result.success) {
				throw new Error(result.error);
			}

			return { ids: result.data.tableRows.map((row) => row.id), totalCount: result.data.totalCount };
		};
	}

	async translateEntityIdsToContactIds(type: MessagingRecipientType, entityIds: string[]): Promise<string[]> {
		if (entityIds.length === 0) {
			return [];
		}
		if (type === 'contributor') {
			const rows = await this.db.contributor.findMany({ where: { id: { in: entityIds } }, select: { contactId: true } });

			return rows.map((r) => r.contactId);
		}
		if (type === 'recipient') {
			const rows = await this.db.recipient.findMany({ where: { id: { in: entityIds } }, select: { contactId: true } });

			return rows.map((r) => r.contactId);
		}
		const rows = await this.db.localPartner.findMany({ where: { id: { in: entityIds } }, select: { contactId: true } });

		return rows.map((r) => r.contactId);
	}

	async resolveContactIds(
		type: MessagingRecipientType,
		selection: SelectionState,
		currentUserId: string,
	): Promise<string[]> {
		const entityIds = await resolveSelectionToIds(selection, this.fetcherFor(type, currentUserId));

		return this.translateEntityIdsToContactIds(type, entityIds);
	}
}
