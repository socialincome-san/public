'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	contributionsTableConfig,
	getContributionsTableFilters,
} from '@/components/data-table/configs/contributions-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import { TableQueryState } from '@/components/data-table/query-state';
import type { ContributionFilterOptions, ContributionTableViewRow } from '@/modules/contributions/contribution.types';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { translateManagementFilters, translateManagementTableConfig } from '../management-table-config';
import { ContributionFormDialog } from './contributions-form-dialog';

export const ContributionsTableClient = ({
	rows,
	error,
	query,
	filterOptions,
}: {
	rows: ContributionTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	filterOptions?: ContributionFilterOptions;
}) => {
	const t = useTranslations('portal-management');
	const { recordId: contributionId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('contributionId');
	const config = translateManagementTableConfig(contributionsTableConfig, {
		title: t('tables.contributions.title'),
		emptyMessage: t('tables.contributions.empty'),
		columns: {
			amount: t('columns.amount'),
			contributor: t('columns.contributor'),
			email: t('columns.email'),
			campaignTitle: t('columns.campaignTitle'),
			programName: t('columns.programName'),
			createdAt: t('columns.createdAt'),
		},
	});
	const filters = translateManagementFilters(
		getContributionsTableFilters({
			query,
			filterOptions: filterOptions ?? { programs: [], campaigns: [], paymentEventTypes: [], contributors: [] },
		}),
		{
			campaign: { label: t('filters.campaign.label'), placeholder: t('filters.campaign.all') },
			program: { label: t('filters.program.label'), placeholder: t('filters.program.all') },
			paymentEventType: { label: t('filters.paymentType.label'), placeholder: t('filters.paymentType.all') },
			contributor: { label: t('filters.contributor.label'), placeholder: t('filters.contributor.all') },
		},
	);

	return (
		<>
			<ConfiguredDataTableClient
				config={config}
				titleInfoTooltip={t('tables.contributions.tooltip')}
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={filters}
				actionMenuItems={[
					{
						label: t('actions.addContribution'),
						icon: <PlusIcon />,
						onSelect: openCreate,
					},
				]}
				onRowClick={(row) => openRecord(row.id)}
			/>

			<ContributionFormDialog open={open} onOpenChange={onOpenChange} contributionId={contributionId} />
		</>
	);
};
