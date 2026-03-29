import { makeMessageTemplateColumns } from '@/components/data-table/columns/message-templates';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { MessageTemplateTableViewRow } from '@/lib/services/messaging/message-template.types';

export const messageTemplatesTableConfig: DataTableConfig<MessageTemplateTableViewRow> = {
	id: 'message-templates',
	title: 'Message Templates',
	emptyMessage: 'No templates found',
	searchKeys: ['id', 'name', 'description'],
	sortOptions: [
		{ id: 'name', label: 'Name' },
		{ id: 'channel', label: 'Channel' },
		{ id: 'isActive', label: 'Status' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeMessageTemplateColumns,
	showColumnVisibilitySelector: true,
};
