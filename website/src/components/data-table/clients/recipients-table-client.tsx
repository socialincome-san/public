'use client';

import { Button } from '@/components/button';
import { makeRecipientColumns } from '@/components/data-table/columns/recipients';
import DataTable from '@/components/data-table/data-table';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { Session } from '@/lib/firebase/current-account';
import { importRecipientsCsvAction } from '@/lib/server-actions/recipient-actions';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { CsvUploadDialog } from './csv-upload-dialog';
import { RecipientDialog } from './recipient-dialog';

type Props = {
	rows: RecipientTableViewRow[];
	error: string | null;
	programId?: string;
	readOnly?: boolean;
	sessionType?: Session['type'];
};

export const RecipientsTableClient = ({ rows, error, programId, readOnly, sessionType = 'user' }: Props) => {
	const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
	const [selectedRecipientId, setSelectedRecipientId] = useState<string | undefined>();
	const [isRecipientReadOnly, setIsRecipientReadOnly] = useState(readOnly ?? false);
	const [recipientError, setRecipientError] = useState<string | null>(null);
	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);

	const openCreateRecipientDialog = () => {
		setRecipientError(null);
		setSelectedRecipientId(undefined);
		setIsRecipientReadOnly(readOnly ?? false);
		setIsRecipientDialogOpen(true);
	};

	const openEditRecipientDialog = (row: RecipientTableViewRow) => {
		setRecipientError(null);
		setSelectedRecipientId(row.id);
		setIsRecipientReadOnly(row.permission === ProgramPermission.owner ? true : (readOnly ?? false));
		setIsRecipientDialogOpen(true);
	};

	const closeRecipientDialog = () => {
		setIsRecipientDialogOpen(false);
		setRecipientError(null);
	};

	return (
		<>
			<DataTable
				title="Recipients"
				error={error}
				emptyMessage="No recipients found"
				data={rows}
				makeColumns={makeRecipientColumns}
				hideLocalPartner={sessionType === 'local-partner'}
				actions={
					<div className="flex gap-2">
						<Button disabled={readOnly} onClick={openCreateRecipientDialog}>
							Add new recipient
						</Button>

						<Button variant="outline" disabled={readOnly} onClick={() => setIsCsvUploadDialogOpen(true)}>
							Upload CSV
							<UploadIcon />
						</Button>
					</div>
				}
				onRowClick={openEditRecipientDialog}
				searchKeys={['firstName', 'lastName', 'localPartnerName', 'programName']}
			/>

			<RecipientDialog
				open={isRecipientDialogOpen}
				onOpenChange={closeRecipientDialog}
				recipientId={selectedRecipientId}
				readOnly={isRecipientReadOnly}
				programId={programId}
				sessionType={sessionType}
				errorMessage={recipientError}
				onError={setRecipientError}
			/>

			<CsvUploadDialog
				open={isCsvUploadDialogOpen}
				onOpenChange={setIsCsvUploadDialogOpen}
				title="Upload recipients CSV"
				template={{
					headers: ['firstName', 'lastName', 'programId', 'localPartnerId'],
					exampleRow: ['John', 'Doe', 'program_id_here', 'local_partner_id_here'],
					filename: 'recipients-import-template.csv',
				}}
				onImport={(file) => importRecipientsCsvAction(file, sessionType)}
			/>
		</>
	);
};
