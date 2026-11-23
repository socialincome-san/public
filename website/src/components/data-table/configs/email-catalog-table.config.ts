import { makeEmailCatalogColumns } from '@/components/data-table/columns/email-catalog';
import type { EmailCatalogEntry } from '@/modules/mail/mail.types';
import type { DataTableConfig } from '../table-config.types';

export const emailCatalogTableConfig: DataTableConfig<EmailCatalogEntry> = {
	id: 'admin-email-catalog',
	title: 'Emails',
	emptyMessage: 'No emails registered',
	searchKeys: ['name', 'key', 'description', 'trigger', 'source'],
	makeColumns: makeEmailCatalogColumns,
};
