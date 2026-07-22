import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';
import type { LocalPartnerTableViewRow } from '@/lib/services/local-partner/local-partner.types';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient-table.types';
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
