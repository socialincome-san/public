'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { makeContributorColumns } from '@/components/data-table/columns/contributors';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { ContributorTableViewRow } from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { logger } from '@socialincome/shared/src/utils/logger';
import { useState } from 'react';
import ContributorsForm from './contributors-form';

export default function ContributorsTable({ rows, error }: { rows: ContributorTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [contributorId, setContributorId] = useState<string | undefined>(undefined);
	const readOnly = rows.some((r) => r.permission === 'readonly');

	const openEditForm = (row: ContributorTableViewRow) => {
		setContributorId(row.id);
		setHasError(false);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setHasError(true);
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
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{readOnly ? 'View' : 'Edit'} Contributor</DialogTitle>
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
						readOnly={readOnly}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
