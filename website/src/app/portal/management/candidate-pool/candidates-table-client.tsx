'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeCandidateColumns } from '@/components/data-table/columns/candidates';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { RecipientForm } from '@/components/recipient/recipient-form';
import type { CandidatesTableViewRow } from '@/lib/services/recipient/recipient.types';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';

export function CandidatesTableClient({
	rows,
	error,
	readOnly,
}: {
	rows: CandidatesTableViewRow[];
	error: string | null;
	readOnly?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [recipientId, setRecipientId] = useState<string | undefined>();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const rowReadOnly = readOnly ?? false;

	const openEmptyForm = () => {
		setRecipientId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: CandidatesTableViewRow) => {
		setRecipientId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setErrorMessage(`Error saving candidate: ${error}`);
		logger.error('Candidate Form Error', { error });
	};

	return (
		<>
			<DataTable
				title="Candidate Pool"
				error={error}
				emptyMessage="No candidates found"
				data={rows}
				makeColumns={makeCandidateColumns}
				actions={
					<Button disabled={readOnly} onClick={openEmptyForm}>
						Add candidate
					</Button>
				}
				onRowClick={openEditForm}
				searchKeys={['firstName', 'lastName', 'localPartnerName']}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{recipientId ? 'Edit Candidate' : 'New Candidate'}</DialogTitle>
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
						variant="candidate"
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
