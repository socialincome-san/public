import { makeMessageColumns } from '@/components/data-table/columns/messages';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { MessageTableViewRow } from '@/lib/services/messaging/messaging-log.types';

export const messagesTableConfig: DataTableConfig<MessageTableViewRow> = {
	id: 'messages',
	title: 'Messages',
	emptyMessage: 'No messages found',
	searchKeys: ['id', 'addressee', 'templateName'],
	sortOptions: [
		{ id: 'channel', label: 'Channel' },
		{ id: 'status', label: 'Status' },
		{ id: 'recipientType', label: 'Entity Type' },
		{ id: 'sentAt', label: 'Sent' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeMessageColumns,
	showColumnVisibilitySelector: true,
};
