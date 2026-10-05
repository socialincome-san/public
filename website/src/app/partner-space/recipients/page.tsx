import type { SearchParamsPageProps } from '@/app/page-props';
import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getPaginatedRecipientTableViewByLocalPartnerId } from '@/modules/recipients/recipient.service';
import type { RecipientTableViewRow } from '@/modules/recipients/recipient.types';
import { requireSession } from '@/server/session';
import { Suspense } from 'react';

const RecipientsPage = ({ searchParams }: SearchParamsPageProps) => {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<RecipientsDataLoader searchParams={searchParams} />
		</Suspense>
	);
};

export default RecipientsPage;

const RecipientsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const partner = await requireSession('local-partner');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedRecipientTableViewByLocalPartnerId(partner.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: RecipientTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];

	return (
		<RecipientsTableClient
			rows={rows}
			error={error}
			readOnly={true}
			sessionType="local-partner"
			query={{ ...tableQuery, totalRows }}
			programFilterOptions={programFilterOptions}
		/>
	);
};
