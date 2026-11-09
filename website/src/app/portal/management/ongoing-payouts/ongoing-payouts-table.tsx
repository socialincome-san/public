'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { ongoingPayoutsTableConfig } from '@/components/data-table/configs/ongoing-payouts-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { TableFilterConfig } from '@/components/data-table/table-config.types';
import type { OngoingPayoutTableViewRow } from '@/modules/payouts/payout.types';
import { useTranslations } from 'next-intl';
import { translateManagementTableConfig } from '../management-table-config';

type Props = {
	rows: OngoingPayoutTableViewRow[];
	error: string | null;
	query: TableQueryState & { totalRows: number };
	toolbarFilters: TableFilterConfig[];
};

export const OngoingPayoutsTable = ({ rows, error, query, toolbarFilters }: Props) => {
	const t = useTranslations('portal-management');
	const config = translateManagementTableConfig(ongoingPayoutsTableConfig, {
		title: t('tables.ongoingPayouts.title'),
		emptyMessage: t('tables.ongoingPayouts.empty'),
		columns: {
			recipient: t('columns.recipient'),
			programName: t('columns.programName'),
			payoutsProgressPercent: t('columns.payoutsProgressPercent'),
		},
	});

	return (
		<ConfiguredDataTableClient
			config={config}
			titleInfoTooltip={t('tables.ongoingPayouts.tooltip')}
			rows={rows}
			error={error}
			query={query}
			toolbarFilters={toolbarFilters}
		/>
	);
};
