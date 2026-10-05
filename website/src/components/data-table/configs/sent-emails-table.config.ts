import { makeSentEmailColumns } from '@/components/data-table/columns/sent-emails';
import type { SentEmailTableViewRow } from '@/modules/mail/mail.types';
import type { DataTableConfig } from '../table-config.types';

export const sentEmailsTableConfig: DataTableConfig<SentEmailTableViewRow> = {
	id: 'admin-sent-emails',
	title: 'Sent emails',
	emptyMessage: 'No sent emails found',
	searchKeys: ['id', 'toEmail', 'subject', 'body', 'fromEmail', 'contact'],
	sortOptions: [
		{ id: 'sentAt', label: 'Sent' },
		{ id: 'toEmail', label: 'To' },
		{ id: 'subject', label: 'Subject' },
		{ id: 'fromEmail', label: 'From' },
		{ id: 'contact', label: 'Contact' },
	],
	initialSorting: [{ id: 'sentAt', desc: true }],
	makeColumns: makeSentEmailColumns,
};
