'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getRecipientsTableFilters,
	recipientsTableConfig,
} from '@/components/data-table/configs/recipients-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { Session } from '@/lib/firebase/current-account';
import { downloadRecipientsCsvAction, importRecipientsCsvAction } from '@/lib/server-actions/recipient-actions';
import type { RecipientProgramFilterOption, RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { downloadCsv as downloadCsvFile } from '@/lib/utils/csv';
import { DownloadIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';
import type { ActionMenuItem } from '../elements/action-menu';
import { CsvUploadDialog } from './csv-upload-dialog';
import { RecipientDialog } from './recipient-dialog';

type Props = {
	rows: RecipientTableViewRow[];
	error: string | null;
	programId?: string;
	readOnly?: boolean;
	sessionType?: Session['type'];
	query?: TableQueryState & { totalRows: number };
	programFilterOptions?: RecipientProgramFilterOption[];
	showProgramFilter?: boolean;
};

export const RecipientsTableClient = ({
	rows,
	error,
	programId,
	readOnly,
	sessionType = 'user',
	query,
	programFilterOptions = [],
	showProgramFilter = true,
}: Props) => {
	const canManageRecipients = sessionType === 'user';
	const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
	const [selectedRecipientId, setSelectedRecipientId] = useState<string | undefined>();
	const [isRecipientReadOnly, setIsRecipientReadOnly] = useState(readOnly ?? false);
	const [recipientError, setRecipientError] = useState<string | null>(null);
	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);
	const [isCsvDownloading, setIsCsvDownloading] = useState(false);

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

	const handleDownloadCsv = async () => {
		setIsCsvDownloading(true);
		const result = await downloadRecipientsCsvAction(sessionType);
		setIsCsvDownloading(false);

		if (!result.success) {
			console.error(result.error);
			return;
		}

		downloadCsvFile(result.data, `recipients-export-${new Date().toISOString().slice(0, 10)}.csv`);
	};

	const actionMenuItems: ActionMenuItem[] = [
		{
			label: isCsvDownloading ? 'Downloading…' : 'Download CSV',
			icon: <DownloadIcon />,
			disabled: isCsvDownloading,
			onSelect: handleDownloadCsv,
		},
		...(canManageRecipients
			? [
					{
						label: 'Add new recipient',
						icon: <PlusIcon />,
						disabled: readOnly,
						onSelect: openCreateRecipientDialog,
					},
					{
						label: 'Upload CSV',
						icon: <UploadIcon />,
						disabled: readOnly,
						onSelect: () => setIsCsvUploadDialogOpen(true),
					},
				]
			: []),
	];

	return (
		<>
			<ConfiguredDataTableClient
				config={recipientsTableConfig}
				rows={rows}
				error={error}
				actionMenuItems={actionMenuItems}
				query={query}
				toolbarFilters={getRecipientsTableFilters({ query, programFilterOptions, showProgramFilter })}
				hideLocalPartner={sessionType === 'local-partner'}
				showEntityIdColumn={sessionType !== 'local-partner'}
				onRowClick={openEditRecipientDialog}
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
