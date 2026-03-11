'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { CsvUploadDialog } from '@/components/data-table/clients/csv-upload-dialog';
import {
	candidatesTableConfig,
	getCandidatesTableFilters,
} from '@/components/data-table/configs/candidates-table.config';
import type { ActionMenuItem } from '@/components/data-table/elements/action-menu';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { Session } from '@/lib/firebase/current-account';
import { downloadCandidatesCsvAction, importCandidatesCsvAction } from '@/lib/server-actions/candidate-actions';
import type { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import { downloadCsv as downloadCsvFile } from '@/lib/utils/csv';
import { DownloadIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { CandidateDialog } from './candidate-dialog';

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
	const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
	const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>();
	const [isReadOnly, setIsReadOnly] = useState(readOnly ?? false);
	const [candidateError, setCandidateError] = useState<string | null>(null);
	const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);
	const [isCsvDownloading, setIsCsvDownloading] = useState(false);

	const openCreateDialog = () => {
		setCandidateError(null);
		setSelectedCandidateId(undefined);
		setIsReadOnly(readOnly ?? false);
		setIsCandidateDialogOpen(true);
	};

	const openEditDialog = (_row: CandidatesTableViewRow) => {
		setCandidateError(null);
		setSelectedCandidateId(_row.id);
		setIsReadOnly(readOnly ?? false);
		setIsCandidateDialogOpen(true);
	};

	const closeCandidateDialog = () => {
		setIsCandidateDialogOpen(false);
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
			onSelect: handleDownloadCsv,
		},
		...(canManageCandidates
			? [
					{
						label: 'Add new candidate',
						icon: <PlusIcon />,
						disabled: readOnly,
						onSelect: openCreateDialog,
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
				config={candidatesTableConfig}
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
				onRowClick={openEditDialog}
			/>

			<CandidateDialog
				open={isCandidateDialogOpen}
				onOpenChange={closeCandidateDialog}
				candidateId={selectedCandidateId}
				readOnly={isReadOnly}
				sessionType={sessionType}
				errorMessage={candidateError}
				onError={setCandidateError}
			/>

			<CsvUploadDialog
				open={isCsvUploadDialogOpen}
				onOpenChange={setIsCsvUploadDialogOpen}
				title="Upload candidates CSV"
				template={{
					headers: ['firstName', 'lastName', 'localPartnerId'],
					exampleRow: ['John', 'Doe', 'local_partner_id_here'],
					filename: 'candidates-import-template.csv',
				}}
				onImport={(file) => importCandidatesCsvAction(file, sessionType)}
			/>
		</>
	);
};
