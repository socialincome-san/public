import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedLocalPartnerTableView } from '@/modules/local-partners/local-partner.service';
import type { LocalPartnerTableViewRow } from '@/modules/local-partners/local-partner.types';
import { requireAdmin } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import LocalPartnersTable from './local-partners-table';

export default function LocalPartnersPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<LocalPartnersDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const LocalPartnersDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireAdmin();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedLocalPartnerTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: LocalPartnerTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <LocalPartnersTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
