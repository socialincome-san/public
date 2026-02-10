'use client';

import { Button } from '@/components/button';
import { CsvUploadDialog } from '@/components/data-table/clients/csv-upload-dialog';
import { makeCandidateColumns } from '@/components/data-table/columns/candidates';
import DataTable from '@/components/data-table/data-table';
import { Actor } from '@/lib/firebase/current-account';
import { importCandidatesCsvAction } from '@/lib/server-actions/candidate-actions';
import type { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { CandidateDialog } from './candidate-dialog';

type Props = {
	rows: CandidatesTableViewRow[];
	error: string | null;
	readOnly?: boolean;
	actorKind?: Actor['kind'];
};

export function CandidatesTableClient({ rows, error, readOnly, actorKind = 'user' }: Props) {
	const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
	const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>();
	const [isReadOnly, setIsReadOnly] = useState(readOnly ?? false);

	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);

	const openCreateDialog = () => {
		setSelectedCandidateId(undefined);
		setIsReadOnly(readOnly ?? false);
		setIsCandidateDialogOpen(true);
	};

	const openEditDialog = (row: CandidatesTableViewRow) => {
		setSelectedCandidateId(row.id);
		setIsCandidateDialogOpen(true);
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
					<div className="flex gap-2">
						<Button disabled={readOnly} onClick={openCreateDialog}>
							Add new candidate
						</Button>

						<Button variant="outline" disabled={readOnly} onClick={() => setIsCsvUploadDialogOpen(true)}>
							Upload CSV
							<UploadIcon />
						</Button>
					</div>
				}
				onRowClick={openEditDialog}
				searchKeys={['firstName', 'lastName', 'localPartnerName']}
			/>
			<CandidateDialog
				open={isCandidateDialogOpen}
				onOpenChange={setIsCandidateDialogOpen}
				candidateId={selectedCandidateId}
				readOnly={isReadOnly}
				actorKind={actorKind}
			/>
			<CsvUploadDialog
				open={isCsvUploadDialogOpen}
				onOpenChange={setIsCsvUploadDialogOpen}
				title="Upload candidates CSV"
				template={{
					headers: ['firstName', 'lastName', 'status', 'localPartnerId'],
					exampleRow: ['John', 'Doe', 'active', 'local_partner_id_here'],
					filename: 'candidates-import-template.csv',
				}}
				onImport={(file) => importCandidatesCsvAction(file)}
			/>
		</>
	);
}
