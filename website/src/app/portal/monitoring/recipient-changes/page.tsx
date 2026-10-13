import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getRecipientChangeTableView } from '@/modules/recipients/recipient.service';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { RecipientChangesTableClient } from './recipient-changes-table-client';

export default function RecipientChangesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<RecipientChangesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const RecipientChangesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireSession('user');
	const tableQuery = tableQueryFromSearchParams(await searchParams);
	const result = await getRecipientChangeTableView(user.id, tableQuery);
	const view = result.success
		? result.data
		: { tableRows: [], totalCount: 0, programFilterOptions: [], recipientFilterOptions: [] };

	return (
		<RecipientChangesTableClient
			view={view}
			error={result.success ? null : result.error}
			query={{ ...tableQuery, totalRows: view.totalCount }}
		/>
	);
};
