'use client';

import { AddRecipientsFromPoolDialog } from '@/components/add-recipients-from-pool/add-recipients-from-pool-dialog';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { makeRecipientColumns } from '@/components/data-table/columns/recipients';
import { getRecipientsTableFilters, recipientsTableConfig } from '@/components/data-table/configs/recipients-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import { TableQueryState } from '@/components/data-table/query-state';
import { usePortalSharedTranslations } from '@/components/portal-shared-translations';
import { downloadCsv as downloadCsvFile } from '@/lib/utils/csv';
import type { Session } from '@/modules/auth/auth.types';
import { downloadRecipientsCsvAction, importRecipientsCsvAction } from '@/modules/recipients/recipient.actions';
import type { RecipientProgramFilterOption, RecipientTableViewRow } from '@/modules/recipients/recipient.types';
import { DownloadIcon, PlusIcon, UploadIcon, UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ActionMenuItem } from '../elements/action-menu';
import { CsvUploadDialog } from './csv-upload-dialog';
import { RecipientDialog } from './recipient-dialog';
import { recipientsCsvTemplate } from './recipients-csv-template';

const recipientSortTranslationKeys = {
	recipient: 'table.recipientColumnRecipient',
	country: 'table.recipientColumnCountry',
	paymentCode: 'table.recipientColumnPaymentCode',
	dateOfBirth: 'table.recipientColumnAge',
	localPartnerName: 'table.recipientColumnLocalPartner',
	programName: 'table.recipientColumnProgram',
	startDate: 'table.recipientColumnStartDate',
	status: 'table.recipientColumnStatus',
	createdAt: 'table.recipientColumnCreated',
} as const;

const isRecipientSortId = (id: string): id is keyof typeof recipientSortTranslationKeys =>
	Object.hasOwn(recipientSortTranslationKeys, id);

const statusTranslationKeys = {
	future: 'table.statusFuture',
	active: 'table.statusActive',
	suspended: 'table.statusSuspended',
	completed: 'table.statusCompleted',
} as const;

const isRecipientStatus = (status: string): status is keyof typeof statusTranslationKeys =>
	Object.hasOwn(statusTranslationKeys, status);

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
	const tPool = useTranslations('add-recipients-from-pool');
	const { isPortal, t } = usePortalSharedTranslations();
	const router = useRouter();
	const canManageRecipients = sessionType === 'user';
	const isReadOnly = readOnly ?? false;
	const canAddFromPool = Boolean(programId) && canManageRecipients && !isReadOnly;
	const canDownloadCsv = sessionType === 'local-partner' || !isReadOnly;
	const baseToolbarFilters = getRecipientsTableFilters({
		query,
		programFilterOptions,
		localPartnerFilterOptions,
		showProgramFilter,
	});
	const toolbarFilters = isPortal
		? baseToolbarFilters.map((filter) => {
				if (filter.id === 'recipientStatus') {
					return {
						...filter,
						label: t('table.filterStatus', filter.label),
						placeholder: t('table.filterAllStatuses', filter.placeholder),
						options: filter.options.map((option) => ({
							...option,
							label: isRecipientStatus(option.value) ? t(statusTranslationKeys[option.value], option.label) : option.label,
						})),
					};
				}
				if (filter.id === 'program') {
					return {
						...filter,
						label: t('table.filterProgram', filter.label),
						placeholder: t('table.filterAllPrograms', filter.placeholder),
					};
				}
				if (filter.id === 'localPartner') {
					return {
						...filter,
						label: t('table.filterLocalPartner', filter.label),
						placeholder: t('table.filterAllLocalPartners', filter.placeholder),
					};
				}

				return filter;
			})
		: baseToolbarFilters;
	const tableConfig = {
		...recipientsTableConfig,
		title: isPortal ? t('table.recipientsTitle', recipientsTableConfig.title) : recipientsTableConfig.title,
		emptyMessage: isPortal ? t('table.recipientsEmpty', 'No recipients found') : recipientsTableConfig.emptyMessage,
		sortOptions: recipientsTableConfig.sortOptions?.map((option) => ({
			...option,
			label:
				isPortal && isRecipientSortId(option.id) ? t(recipientSortTranslationKeys[option.id], option.label) : option.label,
		})),
		makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean) =>
			makeRecipientColumns(hideProgramName, hideLocalPartner, undefined, isReadOnly, isPortal ? t : undefined),
	};
	const recipientDialog = useRecordDialog('recipientId');
	const [recipientError, setRecipientError] = useState<string | null>(null);
	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);
	const [isCsvDownloading, setIsCsvDownloading] = useState(false);
	const [isPoolDialogOpen, setIsPoolDialogOpen] = useState(false);
	const [poolDialogKey, setPoolDialogKey] = useState(0);

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
			label: isCsvDownloading ? t('csv.downloading', 'Downloading…') : t('csv.download', 'Download CSV'),
			icon: <DownloadIcon />,
			disabled: isCsvDownloading || !canDownloadCsv,
			onSelect: () => {
				void handleDownloadCsv();
			},
		},
		...(canManageRecipients
			? [
					{
						label: t('table.addRecipientManually', 'Add new recipient manually'),
						icon: <PlusIcon />,
						disabled: isReadOnly,
						onSelect: openCreateRecipientDialog,
					},
					...(canAddFromPool && programId
						? [
								{
									label: t('table.addRecipientsFromPool', 'Add recipients from pool'),
									icon: <UsersIcon />,
									onSelect: () => {
										setPoolDialogKey((key) => key + 1);
										setIsPoolDialogOpen(true);
									},
								},
							]
						: []),
					{
						label: t('csv.upload', 'Upload CSV'),
						icon: <UploadIcon />,
						disabled: isReadOnly,
						onSelect: () => setIsCsvUploadDialogOpen(true),
					},
				]
			: []),
	];

	return (
		<>
			<ConfiguredDataTableClient
				config={tableConfig}
				titleInfoTooltip={
					isPortal
						? t('table.recipientsTooltip', 'Shows recipients in programs you can access.')
						: 'Shows recipients in programs you can access.'
				}
				rows={rows}
				error={error}
				actionMenuItems={actionMenuItems}
				query={query}
				toolbarFilters={toolbarFilters}
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

			{canAddFromPool && programId && (
				<AddRecipientsFromPoolDialog
					key={poolDialogKey}
					open={isPoolDialogOpen}
					programId={programId}
					onOpenChange={setIsPoolDialogOpen}
					onAssigned={(assignedCount) => {
						setIsPoolDialogOpen(false);
						toast.success(tPool('success', { count: assignedCount }));
						router.refresh();
					}}
				/>
			)}

			<CsvUploadDialog
				open={isCsvUploadDialogOpen}
				onOpenChange={setIsCsvUploadDialogOpen}
				title={t('csv.uploadRecipients', 'Upload recipients CSV')}
				template={recipientsCsvTemplate}
				onImport={(file) => importRecipientsCsvAction(file, sessionType)}
			/>
		</>
	);
};
