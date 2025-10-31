'use client';

import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
import { makeContributorColumns } from '@/app/portal/components/data-table/columns/contributors';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { ContributorTableViewRow } from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { useState } from 'react';
import ContributorsForm from './contributors-form';

export default function ContributorsTable({ rows, error }: { rows: ContributorTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [contributorId, setContributorId] = useState<string | undefined>(undefined);

	const openEditForm = (row: ContributorTableViewRow) => {
		setContributorId(row.id);
		setHasError(false);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setHasError(true);
		console.error('Contributor Form Error: ', error);
	};

	return (
		<>
			<DataTable
				title="Contributors"
				error={error}
				emptyMessage="No contributors found"
				data={rows}
				makeColumns={makeContributorColumns}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425]">
					<DialogHeader>
						<DialogTitle>Edit Contributor</DialogTitle>
					</DialogHeader>
					{hasError && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>Error saving contributor</AlertDescription>
						</Alert>
					)}
					<ContributorsForm
						contributorId={contributorId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
