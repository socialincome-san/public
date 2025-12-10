'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeContributorColumns } from '@/components/data-table/columns/contributors';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import ContributorsForm from './contributors-form';

export default function ContributorsTableClient({
	rows,
	error,
	readOnly,
}: {
	rows: ContributorTableViewRow[];
	error: string | null;
	readOnly?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [contributorId, setContributorId] = useState<string | undefined>();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [rowReadOnly, setRowReadOnly] = useState(readOnly ?? false);

	const openEmptyForm = () => {
		setContributorId(undefined);
		setRowReadOnly(readOnly ?? false);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: ContributorTableViewRow) => {
		setContributorId(row.id);
		setRowReadOnly(row.permission === 'readonly' ? true : (readOnly ?? false));
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setErrorMessage(`Error saving contributor: ${error}`);
		logger.error('Contributor Form Error', { error });
	};

	return (
		<>
			<DataTable
				title="Contributors"
				error={error}
				emptyMessage="No contributors found"
				data={rows}
				makeColumns={makeContributorColumns}
				actions={
					<Button disabled={readOnly} onClick={openEmptyForm}>
						Add new contributor
					</Button>
				}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>
							{rowReadOnly ? 'View Contributor' : contributorId ? 'Edit Contributor' : 'New Contributor'}
						</DialogTitle>
					</DialogHeader>

					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					)}

					<ContributorsForm
						contributorId={contributorId}
						readOnly={rowReadOnly}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
