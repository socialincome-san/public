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
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { translateManagementFilters, translateManagementTableConfig } from '../management-table-config';
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
	const t = useTranslations('portal-management');
	const { recordId: contributorId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('contributorId');
	const config = translateManagementTableConfig(contributorsTableConfig, {
		title: t('tables.contributors.title'),
		emptyMessage: t('tables.contributors.empty'),
		columns: {
			firebaseAuthUserId: t('columns.firebaseAuthUserId'),
			contributor: t('columns.contributor'),
			email: t('columns.email'),
			country: t('columns.country'),
			totalContributedChf: t('columns.totalContributedChf'),
			createdAt: t('columns.createdAt'),
		},
	});
	const filters = translateManagementFilters(getContributorsTableFilters({ query, countryFilterOptions }), {
		country: { label: t('filters.country.label'), placeholder: t('filters.country.all') },
	});
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
		setErrorMessage(t('dialogs.saveContributorError', { message }));
		console.error('Contributor Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={config}
				titleInfoTooltip={t('tables.contributors.tooltip')}
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={filters}
				actionMenuItems={[
					{
						label: t('actions.addContributor'),
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
