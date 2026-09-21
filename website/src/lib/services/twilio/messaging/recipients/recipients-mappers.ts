import type { ContributorTableViewRow } from '@/modules/contributors/contributor.types';
import type { LocalPartnerTableViewRow } from '@/modules/local-partners/local-partner.types';
import type { RecipientTableViewRow } from '@/modules/recipients/recipient.types';
import type { MessagingRecipientRow } from './recipients.types';

export function contributorRowToMessagingRow(row: ContributorTableViewRow): MessagingRecipientRow {
	return {
		id: row.id,
		name: `${row.firstName} ${row.lastName}`.trim(),
		subtitle: row.email ? row.email : null,
	};
}

export function recipientRowToMessagingRow(row: RecipientTableViewRow): MessagingRecipientRow {
	return {
		id: row.id,
		name: `${row.firstName} ${row.lastName}`.trim(),
		subtitle: row.programName ?? row.localPartnerName ?? null,
	};
}

export function localPartnerRowToMessagingRow(row: LocalPartnerTableViewRow): MessagingRecipientRow {
	return {
		id: row.id,
		name: row.name,
		subtitle: row.contactPerson ? row.contactPerson : (row.email ?? null),
	};
}
