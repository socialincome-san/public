'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { makeRecipientColumns } from '@/components/data-table/columns/recipients';
import { getRecipientsTableFilters, recipientsTableConfig } from '@/components/data-table/configs/recipients-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import { TableQueryState } from '@/components/data-table/query-state';
import { downloadCsv as downloadCsvFile } from '@/lib/utils/csv';
import type { Session } from '@/modules/auth/auth.types';
import { downloadRecipientsCsvAction, importRecipientsCsvAction } from '@/modules/recipients/recipient.actions';
import type { RecipientProgramFilterOption, RecipientTableViewRow } from '@/modules/recipients/recipient.types';
import { DownloadIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AddRecipientsFromPoolDialog } from './add-recipients-from-pool-dialog';
import type { ActionMenuItem } from '../elements/action-menu';
import { CsvUploadDialog } from './csv-upload-dialog';
import { RecipientDialog } from './recipient-dialog';
import { recipientsCsvTemplate } from './recipients-csv-template';

type Props = {
	rows: RecipientTableViewRow[];
	error: string | null;
	programId?: string;
	readOnly?: boolean;
	sessionType?: Session['type'];
	query?: TableQueryState & { totalRows: number };
	programFilterOptions?: RecipientProgramFilterOption[];
	localPartnerFilterOptions?: { id: string; name: string }[];
	showProgramFilter?: boolean;
	hideProgramName?: boolean;
};

export const RecipientsTableClient = ({
	rows,
	error,
	programId,
	readOnly,
	sessionType = 'user',
	query,
	programFilterOptions = [],
	localPartnerFilterOptions = [],
	showProgramFilter = true,
	hideProgramName = false,
}: Props) => {
	const t = useTranslations('recipient-pool');
	const canManageRecipients = sessionType === 'user';
	const isReadOnly = readOnly ?? false;
	const canDownloadCsv = sessionType === 'local-partner' || !isReadOnly;
	const tableConfig = {
		...recipientsTableConfig,
		makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean) => {
			return makeRecipientColumns(hideProgramName, hideLocalPartner, undefined, isReadOnly);
		},
	};
	const recipientDialog = useRecordDialog('recipientId');
	const [recipientError, setRecipientError] = useState<string | null>(null);
	const [isPoolOpen, setIsPoolOpen] = useState(false);
	const [poolSuccess, setPoolSuccess] = useState<number | null>(null);
	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);
	const [isCsvDownloading, setIsCsvDownloading] = useState(false);

	const openCreateRecipientDialog = () => {
		setRecipientError(null);
		recipientDialog.openCreate();
	};

	const openEditRecipientDialog = (row: RecipientTableViewRow) => {
		if (isReadOnly) {
			return;
		}

		setRecipientError(null);
		recipientDialog.openRecord(row.id);
	};

	const closeRecipientDialog = () => {
		recipientDialog.close();
		setRecipientError(null);
	};

	const handleDownloadCsv = async () => {
		if (!canDownloadCsv) {
			return;
		}

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
			disabled: isCsvDownloading || !canDownloadCsv,
			onSelect: () => {
				void handleDownloadCsv();
			},
		},
		...(canManageRecipients
			? [
					{
						label: t('manual'),
						icon: <PlusIcon />,
						disabled: isReadOnly,
						onSelect: openCreateRecipientDialog,
					},
					...(programId && !isReadOnly ? [{
						label: t('pool'),
						icon: <PlusIcon />,
						onSelect: () => setIsPoolOpen(true),
					}] : []),
					{
						label: 'Upload CSV',
						icon: <UploadIcon />,
						disabled: isReadOnly,
						onSelect: () => setIsCsvUploadDialogOpen(true),
					},
				]
			: []),
	];

	return (
		<>
			{poolSuccess !== null ? <p role="status">{t('success', { count: poolSuccess })}</p> : null}
			<ConfiguredDataTableClient
				config={tableConfig}
				titleInfoTooltip="Shows recipients in programs you can access."
				rows={rows}
				error={error}
				actionMenuItems={actionMenuItems}
				query={query}
				toolbarFilters={getRecipientsTableFilters({
					query,
					programFilterOptions,
					localPartnerFilterOptions,
					showProgramFilter,
				})}
				hideProgramName={hideProgramName}
				hideLocalPartner={sessionType === 'local-partner'}
				showEntityIdColumn={sessionType !== 'local-partner'}
				onRowClick={isReadOnly ? undefined : openEditRecipientDialog}
			/>

			{!isReadOnly && (
				<RecipientDialog
					open={recipientDialog.open}
					onOpenChange={closeRecipientDialog}
					recipientId={recipientDialog.recordId}
					programId={programId}
					sessionType={sessionType}
					errorMessage={recipientError}
					onError={setRecipientError}
				/>
			)}

			{programId && !isReadOnly && canManageRecipients ? (
				<AddRecipientsFromPoolDialog programId={programId} open={isPoolOpen} onOpenChange={setIsPoolOpen} onSuccess={setPoolSuccess} />
			) : null}
			<CsvUploadDialog
				open={isCsvUploadDialogOpen}
				onOpenChange={setIsCsvUploadDialogOpen}
				title="Upload recipients CSV"
				template={recipientsCsvTemplate}
				onImport={(file) => importRecipientsCsvAction(file, sessionType)}
			/>
		</>
	);
};
