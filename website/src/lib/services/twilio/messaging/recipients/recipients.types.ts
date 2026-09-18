export type MessagingRecipientType = 'contributor' | 'recipient' | 'local-partner';

export type MessagingPhoneSource = 'contact' | 'payment';

export type MessagingPhone = { number: string; hasWhatsApp: boolean };

export type MessagingTarget = { contactId: string; phone: MessagingPhone | null };

export type MessagingRecipientRow = {
	id: string;
	name: string;
	subtitle: string | null;
};

export type MessagingRecipientFilters = {
	programId?: string;
	recipientStatus?: string;
	country?: string;
};

export type MessagingRecipientsQuery = {
	page: number;
	pageSize: number;
	search: string;
	filters?: MessagingRecipientFilters;
};

export type MessagingRecipientFilterOption = { value: string; label: string };

export type MessagingRecipientFilterOptions = {
	program?: MessagingRecipientFilterOption[];
	status?: MessagingRecipientFilterOption[];
	country?: MessagingRecipientFilterOption[];
};

export const RECIPIENT_STATUS_FILTER_OPTIONS: MessagingRecipientFilterOption[] = [
	{ value: 'future', label: 'Future' },
	{ value: 'active', label: 'Active' },
	{ value: 'suspended', label: 'Suspended' },
	{ value: 'completed', label: 'Completed' },
];

export type MessagingRecipientsPage = {
	rows: MessagingRecipientRow[];
	totalCount: number;
	page: number;
	pageSize: number;
	filterOptions: MessagingRecipientFilterOptions;
};
