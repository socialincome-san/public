'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	contributorsTableConfig,
	getContributorsTableFilters,
} from '@/components/data-table/configs/contributors-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import { TableQueryState } from '@/components/data-table/query-state';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { ContributorTableViewRow } from '@/modules/contributors/contributor.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { ContributorDialog } from './contributor-dialog';

export default function ContributorsTableClient({
	rows,
	error,
	query,
	countryFilterOptions = [],
}: {
	rows: ContributorTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	countryFilterOptions?: { value: string; label: string }[];
}) {
	const { recordId: contributorId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('contributorId');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const openEmptyForm = () => {
		setErrorMessage(null);
		openCreate();
	};

	const openEditForm = (row: ContributorTableViewRow) => {
		setErrorMessage(null);
		openRecord(row.id);
	};

	const onError = (error: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error saving contributor: ${message}`);
		console.error('Contributor Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={contributorsTableConfig}
				titleInfoTooltip="Shows contributors in your active organization scope."
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={getContributorsTableFilters({ query, countryFilterOptions })}
				actionMenuItems={[
					{
						label: 'Add new contributor',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<ContributorDialog
				open={open}
				onOpenChange={onOpenChange}
				contributorId={contributorId}
				errorMessage={errorMessage}
				onError={onError}
			/>
		</>
	);
}
