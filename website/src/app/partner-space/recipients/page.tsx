import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedLocalPartnerOrRedirect } from '@/lib/firebase/current-local-partner';
import { RecipientReadService } from '@/lib/services/recipient/recipient-read.service';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

export default function RecipientsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<RecipientsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const RecipientsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const partner = await getAuthenticatedLocalPartnerOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const recipientService = new RecipientReadService();
	const result = await recipientService.getPaginatedTableViewByLocalPartnerId(partner.id, tableQuery);

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
