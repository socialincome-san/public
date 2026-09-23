import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { ProgramPermission } from '@/generated/prisma/enums';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { getPaginatedRecipientTableView } from '@/modules/recipients/recipient.service';
import type { RecipientTableViewRow } from '@/modules/recipients/recipient.types';
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
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedRecipientTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: RecipientTableViewRow[] = result.success ? result.data.tableRows : [];
	const readOnly = result.success ? result.data.permission !== ProgramPermission.operator : true;
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];

	return (
		<RecipientsTableClient
			rows={rows}
			error={error}
			readOnly={readOnly}
			query={{ ...tableQuery, totalRows }}
			programFilterOptions={programFilterOptions}
		/>
	);
};
