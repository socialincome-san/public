export type MessagingRecipientType = 'contributor' | 'recipient' | 'local-partner';

export type MessagingRecipientRow = {
	id: string;
	name: string;
	subtitle: string | null;
};

export type MessagingRecipientsQuery = {
	page: number;
	pageSize: number;
	search: string;
};

export type MessagingRecipientsPage = {
	rows: MessagingRecipientRow[];
	totalCount: number;
	page: number;
	pageSize: number;
};

export type SelectionState =
	{ mode: 'include'; ids: Set<string> } | { mode: 'all-matching'; search: string; excludedIds: Set<string> };

export type PageCheckboxState = 'all' | 'some' | 'none';
