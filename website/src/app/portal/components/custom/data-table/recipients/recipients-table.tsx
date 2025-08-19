'use client';

import { DataTable } from '@/app/portal/components/custom/data-table/data-table';
import { makeRecipientColumns } from '@/app/portal/components/custom/data-table/recipients/recipients-columns';
import { RecipientTableViewRow } from '@socialincome/shared/src/database/services/recipient/recipient.types';

export type RecipientsTableProps = {
	data: RecipientTableViewRow[];
	showProgramName?: boolean;
};

export default function RecipientsTable({ data, showProgramName = false }: RecipientsTableProps) {
	const columns = makeRecipientColumns(showProgramName);
	return <DataTable data={data} columns={columns} />;
}
