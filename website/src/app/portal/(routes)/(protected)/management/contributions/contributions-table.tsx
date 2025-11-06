'use client';

import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
import { makeContributionsColumns } from '@/app/portal/components/data-table/columns/contributions';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { ContributionTableViewRow } from '@socialincome/shared/src/database/services/contribution/contribution.types';
import { useState } from 'react';
import ContributionForm from './contribution-form';

export default function ContributionsTable({
	rows,
	error,
	readOnly,
}: {
	rows: ContributionTableViewRow[];
	error: string | null;
	readOnly: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [contributionId, setContributionId] = useState<string | undefined>(undefined);

	const openEditForm = (row: ContributionTableViewRow) => {
		setContributionId(row.id);
		setHasError(false);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setHasError(true);
		console.error('Contribution Form Error: ', error);
	};

	return (
		<>
			<DataTable
				title="Contributions"
				error={error}
				emptyMessage="No contribution found"
				data={rows}
				makeColumns={makeContributionsColumns}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425]">
					<DialogHeader>
						<DialogTitle>{readOnly ? 'View' : 'Edit'} Contribution</DialogTitle>
					</DialogHeader>
					{hasError && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>Error saving contribution</AlertDescription>
						</Alert>
					)}
					<ContributionForm
						contributionId={contributionId}
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
