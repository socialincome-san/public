import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedSentEmailTableView } from '@/modules/mail/mail.service';
import type { SentEmailTableViewRow } from '@/modules/mail/mail.types';
import { requireAdmin } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import SentMailsTable from './sent-mails-table';

export default function SentMailsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<SentMailsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const SentMailsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireAdmin();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);
	const result = await getPaginatedSentEmailTableView(user.id, tableQuery);

	const rows: SentEmailTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<SentMailsTable
			rows={rows}
			error={result.success ? null : result.error}
			query={{ ...tableQuery, totalRows: result.success ? result.data.totalCount : 0 }}
		/>
	);
};
