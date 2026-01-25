'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeCandidateColumns } from '@/components/data-table/columns/candidates';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Actor } from '@/lib/firebase/current-account';
import type { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import { CandidateForm } from './candidates-form';

export function CandidatesTableClient({
	rows,
	error,
	readOnly,
	actorKind = 'user',
}: {
	rows: CandidatesTableViewRow[];
	error: string | null;
	readOnly?: boolean;
	actorKind?: Actor['kind'];
}) {
	const [open, setOpen] = useState(false);
	const [candidateId, setCandidateId] = useState<string | undefined>();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const rowReadOnly = readOnly ?? false;

	const openEmptyForm = () => {
		setCandidateId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: CandidatesTableViewRow) => {
		setCandidateId(row.id);
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
				hideLocalPartner={actorKind === 'local-partner'}
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
						<DialogTitle>{candidateId ? 'Edit Candidate' : 'New Candidate'}</DialogTitle>
					</DialogHeader>

					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					)}

					<CandidateForm
						candidateId={candidateId}
						readOnly={rowReadOnly}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
						actorKind={actorKind}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
