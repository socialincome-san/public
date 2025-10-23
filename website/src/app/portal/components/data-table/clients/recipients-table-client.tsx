'use client';

import { Button } from '@/app/portal/components/button';
import { makeRecipientColumns } from '@/app/portal/components/data-table/columns/recipients';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { RecipientForm } from '@/app/portal/components/forms/recipient-form';
import type { RecipientTableViewRow } from '@socialincome/shared/src/database/services/recipient/recipient.types';
import { useState } from 'react';

export function RecipientsTableClient({
	rows,
	error,
	userId,
}: {
	rows: RecipientTableViewRow[];
	error: string | null;
	userId: string;
}) {
	const [open, setOpen] = useState(false);

	const [recipientId, setRecipientId] = useState<string | undefined>();
	const [hasError, setHasError] = useState(false);

	const [readOnly, setReadOnly] = useState(false);

	const openEmptyForm = () => {
		setRecipientId(undefined);
		setReadOnly(false);
		setHasError(false);
		setOpen(true);
	};

	const openEditForm = (row: RecipientTableViewRow) => {
		setRecipientId(row.id);
		setReadOnly(row.permission === 'readonly');
		setHasError(false);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setHasError(true);
		console.error('Local Partner Form Error: ', error);
	};

	return (
		<>
			<DataTable
				title="Recipients"
				error={error}
				emptyMessage="No recipients found"
				data={rows}
				makeColumns={makeRecipientColumns}
				actions={<Button onClick={openEmptyForm}>Add new recipient</Button>}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425]">
					<DialogHeader>
						<DialogTitle>{readOnly ? 'View Recipient' : recipientId ? 'Edit Recipient' : 'New Recipient'}</DialogTitle>
					</DialogHeader>
					<RecipientForm
						recipientId={recipientId}
						userId={userId}
						readOnly={readOnly}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
