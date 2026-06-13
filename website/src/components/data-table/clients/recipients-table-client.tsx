'use client';

import RecipientSendDialog from '@/app/portal/management/recipients/recipient-send-dialog';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { makeRecipientColumns, RecipientTableCallbacksContext } from '@/components/data-table/columns/recipients';
import { getRecipientsTableFilters, recipientsTableConfig } from '@/components/data-table/configs/recipients-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import type { Session } from '@/lib/firebase/current-account';
import type { Translator } from '@/lib/i18n/translator';
import { getFilteredRecipientIdsAction } from '@/lib/server-actions/messaging-actions';
import { downloadRecipientsCsvAction, importRecipientsCsvAction } from '@/lib/server-actions/recipient-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import type { RecipientTableQuery } from '@/lib/services/recipient/recipient-table.types';
import type { RecipientProgramFilterOption, RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { downloadCsv as downloadCsvFile } from '@/lib/utils/csv';
import { DownloadIcon, PlusIcon, SendIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';
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
	showProgramFilter = true,
	hideProgramName = false,
}: Props) => {
	const canManageRecipients = sessionType === 'user';
	const isReadOnly = readOnly ?? false;
	const canDownloadCsv = sessionType === 'local-partner' || !isReadOnly;
	const tableConfig = {
		...recipientsTableConfig,
		makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean, translator?: Translator) => {
			return makeRecipientColumns(hideProgramName, hideLocalPartner, translator, isReadOnly);
		},
	};
	const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
	const [selectedRecipientId, setSelectedRecipientId] = useState<string | undefined>();
	const [recipientError, setRecipientError] = useState<string | null>(null);
	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);
	const [isCsvDownloading, setIsCsvDownloading] = useState(false);
	const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
	const [sendRecipientIds, setSendRecipientIds] = useState<string[]>([]);
	const [isLoadingRecipientIds, setIsLoadingRecipientIds] = useState(false);

	const openCreateRecipientDialog = () => {
		setRecipientError(null);
		setSelectedRecipientId(undefined);
		setIsRecipientDialogOpen(true);
	};

	const openEditRecipientDialog = (row: RecipientTableViewRow) => {
		if (isReadOnly) {
			return;
		}

		setRecipientError(null);
		setSelectedRecipientId(row.id);
		setIsRecipientDialogOpen(true);
	};

	const closeRecipientDialog = () => {
		setIsRecipientDialogOpen(false);
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

	const openSendDialogForRow = (recipientId: string) => {
		setSendRecipientIds([recipientId]);
		setIsSendDialogOpen(true);
	};

	const openSendDialogForFiltered = async () => {
		if (!query) {
			return;
		}
		setIsLoadingRecipientIds(true);
		const filterQuery: RecipientTableQuery = {
			page: 1,
			pageSize: 1,
			search: query.search,
			programId: query.programId,
			recipientStatus: query.recipientStatus,
		};
		const result = await getFilteredRecipientIdsAction(filterQuery);
		setIsLoadingRecipientIds(false);
		handleServiceResult(result, {
			onSuccess: (ids) => {
				setSendRecipientIds(ids);
				setIsSendDialogOpen(true);
			},
			onError: (err) => console.error('Failed to load recipient IDs:', err),
		});
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
						label: 'Add new recipient',
						icon: <PlusIcon />,
						disabled: isReadOnly,
						onSelect: openCreateRecipientDialog,
					},
					{
						label: 'Upload CSV',
						icon: <UploadIcon />,
						disabled: isReadOnly,
						onSelect: () => setIsCsvUploadDialogOpen(true),
					},
					{
						label: isLoadingRecipientIds ? 'Loading…' : 'Send message',
						icon: <SendIcon />,
						disabled: isReadOnly || isLoadingRecipientIds,
						onSelect: () => {
							void openSendDialogForFiltered();
						},
					},
				]
			: []),
	];

	return (
		<RecipientTableCallbacksContext.Provider
			value={{
				onEdit: openEditRecipientDialog,
				onSendMessage: openSendDialogForRow,
			}}
		>
			<>
				<ConfiguredDataTableClient
					config={tableConfig}
					titleInfoTooltip="Shows recipients in programs you can access."
					rows={rows}
					error={error}
					actionMenuItems={actionMenuItems}
					query={query}
					toolbarFilters={getRecipientsTableFilters({ query, programFilterOptions, showProgramFilter })}
					hideProgramName={hideProgramName}
					hideLocalPartner={sessionType === 'local-partner'}
					showEntityIdColumn={sessionType !== 'local-partner'}
					onRowClick={isReadOnly ? undefined : openEditRecipientDialog}
				/>

				{!isReadOnly && (
					<RecipientDialog
						open={isRecipientDialogOpen}
						onOpenChange={closeRecipientDialog}
						recipientId={selectedRecipientId}
						programId={programId}
						sessionType={sessionType}
						errorMessage={recipientError}
						onError={setRecipientError}
					/>
				)}

				<CsvUploadDialog
					open={isCsvUploadDialogOpen}
					onOpenChange={setIsCsvUploadDialogOpen}
					title="Upload recipients CSV"
					template={recipientsCsvTemplate}
					onImport={(file) => importRecipientsCsvAction(file, sessionType)}
				/>

				<RecipientSendDialog recipientIds={sendRecipientIds} open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen} />
			</>
		</RecipientTableCallbacksContext.Provider>
	);
};
