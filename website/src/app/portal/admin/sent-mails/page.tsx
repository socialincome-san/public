import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { getPaginatedSentEmailTableView } from '@/modules/mail/mail.service';
import type { SentEmailTableViewRow } from '@/modules/mail/mail.types';
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
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);
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
