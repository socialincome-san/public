import { makeSentEmailColumns } from '@/components/data-table/columns/sent-emails';
import type { SentEmailTableViewRow } from '@/lib/services/sent-email/sent-email.types';
import type { DataTableConfig } from '../table-config.types';

export const sentEmailsTableConfig: DataTableConfig<SentEmailTableViewRow> = {
	id: 'admin-sent-emails',
	title: 'Sent emails',
	emptyMessage: 'No sent emails found',
	searchKeys: ['id', 'toEmail', 'subject', 'body', 'fromEmail', 'contact'],
	initialSorting: [{ id: 'sentAt', desc: true }],
	makeColumns: makeSentEmailColumns,
};
