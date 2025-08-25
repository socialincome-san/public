'use client';

import { Button } from '@/app/portal/components/button';
import { makeRecipientColumns } from '@/app/portal/components/data-table/columns/recipients';
import DataTable from '@/app/portal/components/data-table/data-table';
import { RecipientForm } from '@/app/portal/components/forms/recipient-form';
import { Modal } from '@/app/portal/components/modal';
import type { RecipientTableViewRow } from '@socialincome/shared/src/database/services/recipient/recipient.types';
import { useState } from 'react';

export function RecipientsTableClient({ rows, error }: { rows: RecipientTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);
	const [initialValues, setInitialValues] = useState<{ firstName?: string; lastName?: string } | undefined>(undefined);
	const [readOnly, setReadOnly] = useState(false);

	const openBlank = () => {
		setInitialValues(undefined);
		setReadOnly(false);
		setOpen(true);
	};

	const handleRowClick = (row: RecipientTableViewRow) => {
		setInitialValues({ firstName: row.firstName, lastName: row.lastName });
		setReadOnly(row.permission !== 'operator');
		setOpen(true);
	};

	return (
		<>
			<DataTable
				title="Recipients"
				error={error}
				emptyMessage="No recipients found"
				data={rows}
				makeColumns={makeRecipientColumns}
				actions={<Button onClick={openBlank}>Add new recipient</Button>}
				onRowClick={handleRowClick}
			/>

			<Modal open={open} onOpenChange={setOpen}>
				<RecipientForm initialValues={initialValues} readOnly={readOnly} onSuccess={() => setOpen(false)} />
			</Modal>
		</>
	);
}
