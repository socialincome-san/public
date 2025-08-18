'use client';

import { DataTable } from '@/app/portal/components/custom/data-table/data-table';
import { makeRecipientColumns } from '@/app/portal/components/custom/data-table/recipients/recipients-columns';
import type { RecipientTableFlatShape } from '@socialincome/shared/src/database/services/recipient/recipient.types';

export default function RecipientsTable({ data, readOnly }: { data: RecipientTableFlatShape[]; readOnly: boolean }) {
	const columns = makeRecipientColumns(readOnly);
	return <DataTable data={data} columns={columns} />;
}
