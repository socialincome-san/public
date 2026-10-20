'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getSubscriptionsTableFilters,
	subscriptionsTableConfig,
} from '@/components/data-table/configs/subscriptions-table.config';
import { type TableQueryState } from '@/components/data-table/query-state';
import { type SubscriptionTableViewRow } from '@/modules/subscriptions/subscription.types';
import { useTranslations } from 'next-intl';
import { translateManagementFilters, translateManagementTableConfig } from '../management-table-config';

export const SubscriptionsTableClient = ({
	rows,
	error,
	query,
	contributorFilterOptions,
	campaignFilterOptions,
}: {
	rows: SubscriptionTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	contributorFilterOptions: { id: string; name: string }[];
	campaignFilterOptions: { id: string; name: string }[];
}) => {
	const t = useTranslations('portal-management');
	const config = translateManagementTableConfig(subscriptionsTableConfig, {
		title: t('tables.subscriptions.title'),
		emptyMessage: t('tables.subscriptions.empty'),
		columns: {
			contributor: t('columns.contributor'),
			email: t('columns.email'),
			amount: t('columns.amount'),
			status: t('columns.status'),
			cancellationReason: t('columns.cancellationReason'),
			paymentMethod: t('columns.paymentMethod'),
			stripeSubscriptionId: t('columns.stripeSubscriptionId'),
			bankStandingOrderReference: t('columns.bankStandingOrderReference'),
			createdAt: t('columns.createdAt'),
		},
	});
	const filters = translateManagementFilters(
		getSubscriptionsTableFilters({ query, contributorFilterOptions, campaignFilterOptions }),
		{
			contributor: { label: t('filters.contributor.label'), placeholder: t('filters.contributor.all') },
			campaign: { label: t('filters.campaign.label'), placeholder: t('filters.campaign.all') },
		},
	);

	return (
		<ConfiguredDataTableClient
			config={config}
			titleInfoTooltip={t('tables.subscriptions.tooltip')}
			rows={rows}
			error={error}
			query={query}
			toolbarFilters={filters}
		/>
	);
};
