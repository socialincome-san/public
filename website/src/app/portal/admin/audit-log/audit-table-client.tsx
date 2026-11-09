'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { auditTableConfig, getAuditTableFilters } from '@/components/data-table/configs/audit-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { AuditTableView } from '@/modules/audit/audit.types';
import { useTranslations } from 'next-intl';

export const AuditTableClient = ({
	view,
	error,
	query,
}: {
	view: AuditTableView;
	error: string | null;
	query: TableQueryState & { totalRows: number };
}) => {
	const t = useTranslations('portal-admin');

	return (
		<ConfiguredDataTableClient
			config={{
				...auditTableConfig,
				title: t('table.auditLog'),
				emptyMessage: t('table.noAuditEvents'),
			}}
			titleInfoTooltip={t('table.auditTooltip')}
			rows={view.tableRows}
			error={error}
			query={query}
			toolbarFilters={getAuditTableFilters(query)}
		/>
	);
};
