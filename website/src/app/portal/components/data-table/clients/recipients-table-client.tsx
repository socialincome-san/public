'use client';

import { Button } from '@/app/portal/components/button';
import { makeRecipientColumns } from '@/app/portal/components/data-table/columns/recipients';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { RecipientForm } from '@/app/portal/components/forms/recipient-form';
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

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-[425]">
					<DialogHeader>
						<DialogTitle>
							{readOnly ? 'View Recipient' : initialValues ? 'Edit Recipient' : 'New Recipient'}
						</DialogTitle>
					</DialogHeader>
					<RecipientForm initialValues={initialValues} readOnly={readOnly} onSuccess={() => setOpen(false)} />
				</DialogContent>
			</Dialog>
		</>
	);
}
