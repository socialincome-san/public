'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeRecipientColumns } from '@/components/data-table/columns/recipients';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { RecipientForm } from '@/components/recipient/recipient-form';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { logger } from '@/utils/logger';
import { ProgramPermission } from '@prisma/client';
import { useState } from 'react';

export function RecipientsTableClient({
	rows,
	error,
	programId,
	readOnly,
}: {
	rows: RecipientTableViewRow[];
	error: string | null;
	programId?: string;
	readOnly?: boolean;
}) {
	const [open, setOpen] = useState(false);

	const [recipientId, setRecipientId] = useState<string | undefined>();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [rowReadOnly, setRowReadOnly] = useState(readOnly ?? false);

	const openEmptyForm = () => {
		setRecipientId(undefined);
		setRowReadOnly(readOnly ?? false);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: RecipientTableViewRow) => {
		setRecipientId(row.id);
		setRowReadOnly(row.permission === ProgramPermission.owner ? true : (readOnly ?? false));
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setErrorMessage(`Error saving recipient: ${error}`);
		logger.error('Recipient Form Error', { error });
	};

	return (
		<>
			<DataTable
				title="Recipients"
				error={error}
				emptyMessage="No recipients found"
				data={rows}
				makeColumns={makeRecipientColumns}
				actions={
					<Button disabled={readOnly} onClick={openEmptyForm}>
						Add new recipient
					</Button>
				}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>
							{rowReadOnly ? 'View Recipient' : recipientId ? 'Edit Recipient' : 'New Recipient'}
						</DialogTitle>
					</DialogHeader>
					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					)}
					<RecipientForm
						recipientId={recipientId}
						readOnly={rowReadOnly}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
						programId={programId}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
