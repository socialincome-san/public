'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { CsvUploadDialog } from '@/components/data-table/clients/csv-upload-dialog';
import { makeCandidateColumns } from '@/components/data-table/columns/candidates';
import { candidatesTableConfig, getCandidatesTableFilters } from '@/components/data-table/configs/candidates-table.config';
import type { ActionMenuItem } from '@/components/data-table/elements/action-menu';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableTranslator } from '@/components/data-table/table-config.types';
import { downloadCsv as downloadCsvFile } from '@/lib/utils/csv';
import type { Session } from '@/modules/auth/auth.types';
import { downloadCandidatesCsvAction, importCandidatesCsvAction } from '@/modules/candidates/candidate.actions';
import type { CandidatesTableViewRow } from '@/modules/candidates/candidate.types';
import { DownloadIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CandidateDialog } from './candidate-dialog';
import { candidatesCsvTemplate } from './candidates-csv-template';

type Props = {
	rows: CandidatesTableViewRow[];
	error: string | null;
	readOnly?: boolean;
	sessionType?: Session['type'];
	query?: TableQueryState & { totalRows: number };
	countryFilterOptions?: { value: string; label: string }[];
	genderFilterOptions?: { value: string; label: string }[];
	localPartnerFilterOptions?: { value: string; label: string }[];
	showGenderFilter?: boolean;
};

export const CandidatesTableClient = ({
	rows,
	error,
	readOnly,
	sessionType = 'user',
	query,
	countryFilterOptions = [],
	genderFilterOptions = [],
	localPartnerFilterOptions = [],
	showGenderFilter = false,
}: Props) => {
	const t = useTranslations('portal-admin');
	const canManageCandidates = sessionType === 'user';
	const isReadOnly = readOnly ?? false;
	const tableConfig = {
		...candidatesTableConfig,
		makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean, t?: DataTableTranslator) =>
			makeCandidateColumns(hideProgramName, hideLocalPartner, t, isReadOnly),
	};
	const candidateDialog = useRecordDialog('candidateId');
	const [candidateError, setCandidateError] = useState<string | null>(null);
	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);
	const [isCsvDownloading, setIsCsvDownloading] = useState(false);

	const openCreateDialog = () => {
		setCandidateError(null);
		candidateDialog.openCreate();
	};

	const openEditDialog = (row: CandidatesTableViewRow) => {
		setCandidateError(null);
		candidateDialog.openRecord(row.id);
	};

	const closeCandidateDialog = () => {
		candidateDialog.close();
		setCandidateError(null);
	};

	const handleDownloadCsv = async () => {
		setIsCsvDownloading(true);
		const result = await downloadCandidatesCsvAction(sessionType);
		setIsCsvDownloading(false);

		if (!result.success) {
			console.error(result.error);

			return;
		}

		downloadCsvFile(result.data, `candidates-export-${new Date().toISOString().slice(0, 10)}.csv`);
	};

	const actionMenuItems: ActionMenuItem[] = [
		{
			label: isCsvDownloading ? t('actions.downloading') : t('actions.downloadCsv'),
			icon: <DownloadIcon />,
			disabled: isCsvDownloading,
			onSelect: () => {
				void handleDownloadCsv();
			},
		},
		...(canManageCandidates
			? [
					{
						label: t('actions.addCandidate'),
						icon: <PlusIcon />,
						disabled: isReadOnly,
						onSelect: openCreateDialog,
					},
					{
						label: t('actions.uploadCsv'),
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
				config={{
					...tableConfig,
					title: t('table.candidatePool'),
					emptyMessage: t('table.noCandidates'),
				}}
				titleInfoTooltip={t('table.candidatesTooltip')}
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={getCandidatesTableFilters({
					query,
					filterOptions: {
						countries: countryFilterOptions,
						genders: genderFilterOptions,
						localPartners: localPartnerFilterOptions,
					},
					showLocalPartnerFilter: sessionType !== 'local-partner',
					showGenderFilter,
				})}
				hideLocalPartner={sessionType === 'local-partner'}
				showEntityIdColumn={sessionType !== 'local-partner'}
				actionMenuItems={actionMenuItems}
				onRowClick={isReadOnly ? undefined : openEditDialog}
			/>

			{!isReadOnly && (
				<CandidateDialog
					open={candidateDialog.open}
					onOpenChange={closeCandidateDialog}
					candidateId={candidateDialog.recordId}
					sessionType={sessionType}
					errorMessage={candidateError}
					onError={setCandidateError}
				/>
			)}

			<CsvUploadDialog
				open={isCsvUploadDialogOpen}
				onOpenChange={setIsCsvUploadDialogOpen}
				title={t('csv.title')}
				template={candidatesCsvTemplate}
				onImport={(file) => importCandidatesCsvAction(file, sessionType)}
			/>
		</>
	);
};
