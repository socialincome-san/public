import { PrismaClient } from '@/generated/prisma/client';
import type { ContributorReadService } from '../../../contributor/contributor-read.service';
import { BaseService } from '../../../core/base.service';
import type { ServiceResult } from '../../../core/base.types';
import type { LocalPartnerReadService } from '../../../local-partner/local-partner-read.service';
import type { RecipientReadService } from '../../../recipient/recipient-read.service';
import { pickTargetPhone } from './phone-source';
import type { MessagingPhone, MessagingPhoneSource, MessagingRecipientType, MessagingTarget } from './recipients.types';
import { resolveSelectionToIds, type RowFetcher } from './resolve-selection';
import type { SelectionState } from './selection.types';

type TableViewPage = { tableRows: { id: string }[]; totalCount: number };

// Adapts a paginated table view into the page shape `resolveSelectionToIds` walks through.
const toFetchedPage = (result: ServiceResult<TableViewPage>): { ids: string[]; totalCount: number } => {
	if (!result.success) {
		throw new Error(result.error);
	}

	return { ids: result.data.tableRows.map((row) => row.id), totalCount: result.data.totalCount };
};

const contactPhoneTarget = (row: { contactId: string; contact: { phone: MessagingPhone | null } }): MessagingTarget => ({
	contactId: row.contactId,
	phone: row.contact.phone,
});

export class MessagingRecipientsService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly contributorRead: ContributorReadService,
		private readonly recipientRead: RecipientReadService,
		private readonly localPartnerRead: LocalPartnerReadService,
	) {
		super(db);
	}

	async resolveTargets(
		type: MessagingRecipientType,
		selection: SelectionState,
		phoneSource: MessagingPhoneSource,
		phoneFallbackAllowed: boolean,
		currentUserId: string,
	): Promise<MessagingTarget[]> {
		const entityIds = await resolveSelectionToIds(selection, this.fetcherFor(type, currentUserId));

		return this.translateEntityIdsToTargets(type, entityIds, phoneSource, phoneFallbackAllowed);
	}

	private fetcherFor(type: MessagingRecipientType, currentUserId: string): RowFetcher {
		switch (type) {
			case 'recipient':
				return this.recipientFetcher(currentUserId);
			case 'contributor':
				return this.contributorFetcher(currentUserId);
			case 'local-partner':
				return this.localPartnerFetcher(currentUserId);
		}
	}

	private recipientFetcher(currentUserId: string): RowFetcher {
		return async (page, pageSize, search, filters) =>
			toFetchedPage(
				await this.recipientRead.getPaginatedTableView(currentUserId, {
					page,
					pageSize,
					search,
					programId: filters.programId,
					recipientStatus: filters.recipientStatus,
				}),
			);
	}

	private contributorFetcher(currentUserId: string): RowFetcher {
		return async (page, pageSize, search, filters) =>
			toFetchedPage(
				await this.contributorRead.getPaginatedTableView(currentUserId, {
					page,
					pageSize,
					search,
					country: filters.country,
				}),
			);
	}

	private localPartnerFetcher(currentUserId: string): RowFetcher {
		return async (page, pageSize, search) =>
			toFetchedPage(await this.localPartnerRead.getPaginatedTableView(currentUserId, { page, pageSize, search }));
	}

	async translateEntityIdsToTargets(
		type: MessagingRecipientType,
		entityIds: string[],
		phoneSource: MessagingPhoneSource,
		phoneFallbackAllowed: boolean,
	): Promise<MessagingTarget[]> {
		if (entityIds.length === 0) {
			return [];
		}
		switch (type) {
			case 'recipient':
				return this.recipientTargets(entityIds, phoneSource, phoneFallbackAllowed);
			case 'contributor':
				return this.contributorTargets(entityIds);
			case 'local-partner':
				return this.localPartnerTargets(entityIds);
		}
	}

	// Recipients have a contact phone and a payment phone; the caller chooses which one to target.
	private async recipientTargets(
		entityIds: string[],
		phoneSource: MessagingPhoneSource,
		phoneFallbackAllowed: boolean,
	): Promise<MessagingTarget[]> {
		const rows = await this.db.recipient.findMany({
			where: { id: { in: entityIds } },
			select: {
				contactId: true,
				contact: { select: { phone: { select: { number: true, hasWhatsApp: true } } } },
				paymentInformation: { select: { phone: { select: { number: true, hasWhatsApp: true } } } },
			},
		});

		return rows.map((row) => ({
			contactId: row.contactId,
			phone: pickTargetPhone({
				source: phoneSource,
				fallback: phoneFallbackAllowed,
				contactPhone: row.contact.phone,
				paymentPhone: row.paymentInformation?.phone ?? null,
			}),
		}));
	}

	// Contributors only have a contact phone; callers reject the payment source before resolution.
	private async contributorTargets(entityIds: string[]): Promise<MessagingTarget[]> {
		const rows = await this.db.contributor.findMany({
			where: { id: { in: entityIds } },
			select: { contactId: true, contact: { select: { phone: { select: { number: true, hasWhatsApp: true } } } } },
		});

		return rows.map(contactPhoneTarget);
	}

	// Local partners only have a contact phone; callers reject the payment source before resolution.
	private async localPartnerTargets(entityIds: string[]): Promise<MessagingTarget[]> {
		const rows = await this.db.localPartner.findMany({
			where: { id: { in: entityIds } },
			select: { contactId: true, contact: { select: { phone: { select: { number: true, hasWhatsApp: true } } } } },
		});

		return rows.map(contactPhoneTarget);
	}
}
