'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { CsvUploadDialog } from '@/components/data-table/clients/csv-upload-dialog';
import { makeCandidateColumns } from '@/components/data-table/columns/candidates';
import { candidatesTableConfig, getCandidatesTableFilters } from '@/components/data-table/configs/candidates-table.config';
import type { ActionMenuItem } from '@/components/data-table/elements/action-menu';
import { useSearchParamState } from '@/components/data-table/hooks/use-search-param-state';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableTranslator } from '@/components/data-table/table-config.types';
import { downloadCsv as downloadCsvFile } from '@/lib/utils/csv';
import type { Session } from '@/modules/auth/auth.types';
import { downloadCandidatesCsvAction, importCandidatesCsvAction } from '@/modules/candidates/candidate.actions';
import type { CandidatesTableViewRow } from '@/modules/candidates/candidate.types';
import { DownloadIcon, PlusIcon, UploadIcon } from 'lucide-react';
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
	const canManageCandidates = sessionType === 'user';
	const isReadOnly = readOnly ?? false;
	const tableConfig = {
		...candidatesTableConfig,
		makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean, t?: DataTableTranslator) =>
			makeCandidateColumns(hideProgramName, hideLocalPartner, t, isReadOnly),
	};
	const [selectedCandidateId, setSelectedCandidateId] = useSearchParamState('candidateId');
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [candidateError, setCandidateError] = useState<string | null>(null);
	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);
	const [isCsvDownloading, setIsCsvDownloading] = useState(false);

	const openCreateDialog = () => {
		setCandidateError(null);
		setSelectedCandidateId(undefined);
		setIsCreateDialogOpen(true);
	};

	const openEditDialog = (row: CandidatesTableViewRow) => {
		setCandidateError(null);
		setSelectedCandidateId(row.id);
	};

	const closeCandidateDialog = () => {
		setIsCreateDialogOpen(false);
		setSelectedCandidateId(undefined);
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
			label: isCsvDownloading ? 'Downloading…' : 'Download CSV',
			icon: <DownloadIcon />,
			disabled: isCsvDownloading,
			onSelect: () => {
				void handleDownloadCsv();
			},
		},
		...(canManageCandidates
			? [
					{
						label: 'Add new candidate',
						icon: <PlusIcon />,
						disabled: isReadOnly,
						onSelect: openCreateDialog,
					},
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
			<ConfiguredDataTableClient
				config={tableConfig}
				titleInfoTooltip="Shows candidate records awaiting program assignment."
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
					open={isCreateDialogOpen || selectedCandidateId !== undefined}
					onOpenChange={closeCandidateDialog}
					candidateId={selectedCandidateId}
					sessionType={sessionType}
					errorMessage={candidateError}
					onError={setCandidateError}
				/>
			)}

			<CsvUploadDialog
				open={isCsvUploadDialogOpen}
				onOpenChange={setIsCsvUploadDialogOpen}
				title="Upload candidates CSV"
				template={candidatesCsvTemplate}
				onImport={(file) => importCandidatesCsvAction(file, sessionType)}
			/>
		</>
	);
};
