'use client';

import { Button } from '@/components/button';
import { makeRecipientColumns } from '@/components/data-table/columns/recipients';
import DataTable from '@/components/data-table/data-table';
import { ProgramPermission } from '@/generated/prisma/client';
import { Actor } from '@/lib/firebase/current-account';
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
	actorKind?: Actor['kind'];
};

export function RecipientsTableClient({ rows, error, programId, readOnly, actorKind = 'user' }: Props) {
	const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
	const [selectedRecipientId, setSelectedRecipientId] = useState<string | undefined>();
	const [isRecipientReadOnly, setIsRecipientReadOnly] = useState(readOnly ?? false);

	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);

	const openCreateRecipientDialog = () => {
		setSelectedRecipientId(undefined);
		setIsRecipientReadOnly(readOnly ?? false);
		setIsRecipientDialogOpen(true);
	};

	const openEditRecipientDialog = (row: RecipientTableViewRow) => {
		setSelectedRecipientId(row.id);
		setIsRecipientReadOnly(row.permission === ProgramPermission.owner ? true : (readOnly ?? false));
		setIsRecipientDialogOpen(true);
	};

	return (
		<>
			<DataTable
				title="Recipients"
				error={error}
				emptyMessage="No recipients found"
				data={rows}
				makeColumns={makeRecipientColumns}
				hideLocalPartner={actorKind === 'local-partner'}
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
				onOpenChange={setIsRecipientDialogOpen}
				recipientId={selectedRecipientId}
				readOnly={isRecipientReadOnly}
				programId={programId}
				actorKind={actorKind}
			/>

			<CsvUploadDialog open={isCsvUploadDialogOpen} onOpenChange={setIsCsvUploadDialogOpen} />
		</>
	);
}
