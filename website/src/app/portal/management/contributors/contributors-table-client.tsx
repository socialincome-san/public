'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	contributorsTableConfig,
	getContributorsTableFilters,
} from '@/components/data-table/configs/contributors-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import ContributorsForm from './contributors-form';

export default function ContributorsTableClient({
	rows,
	error,
	readOnly,
	query,
	countryFilterOptions = [],
}: {
	rows: ContributorTableViewRow[];
	error: string | null;
	readOnly?: boolean;
	query?: TableQueryState & { totalRows: number };
	countryFilterOptions?: { value: string; label: string }[];
}) {
	const [open, setOpen] = useState(false);
	const [contributorId, setContributorId] = useState<string | undefined>();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [rowReadOnly, setRowReadOnly] = useState(readOnly ?? false);

	const openEmptyForm = () => {
		setContributorId(undefined);
		setRowReadOnly(readOnly ?? false);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: ContributorTableViewRow) => {
		setContributorId(row.id);
		setRowReadOnly(row.permission === 'readonly' ? true : (readOnly ?? false));
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error saving contributor: ${message}`);
		logger.error('Contributor Form Error', { error });
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
						disabled: readOnly,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>
							{rowReadOnly ? 'View Contributor' : contributorId ? 'Edit Contributor' : 'New Contributor'}
						</DialogTitle>
					</DialogHeader>

					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
						</Alert>
					)}

					<ContributorsForm
						contributorId={contributorId}
						readOnly={rowReadOnly}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
