import { Card } from '@/components/card';
import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { ProgramPermission } from '@/generated/prisma/enums';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

type Props = SearchParamsPageProps & { params: Promise<{ programId: string }> };

export default function RecipientsPageProgramScoped({ params, searchParams }: Props) {
	return (
		<Card>
			<Suspense fallback={<AppLoadingSkeleton />}>
				<RecipientsProgramScopedDataLoader params={params} searchParams={searchParams} />
			</Suspense>
		</Card>
	);
}

const RecipientsProgramScopedDataLoader = async ({ params, searchParams }: Props) => {
	const { programId } = await params;
	const resolvedSearchParams = await searchParams;
	const baseQuery = tableQueryFromSearchParams(resolvedSearchParams);
	const tableQuery = { ...baseQuery, programId };
	const user = await getAuthenticatedUserOrRedirect();

	const recipientsResult = await services.read.recipient.getPaginatedTableView(user.id, tableQuery);

	const error = recipientsResult.success ? null : recipientsResult.error;
	const rows: RecipientTableViewRow[] = recipientsResult.success ? recipientsResult.data.tableRows : [];
	const readOnly = recipientsResult.success ? recipientsResult.data.permission !== ProgramPermission.operator : true;
	const totalRows = recipientsResult.success ? recipientsResult.data.totalCount : 0;

	return (
		<RecipientsTableClient
			rows={rows}
			error={error}
			programId={programId}
			readOnly={readOnly}
			query={{ ...tableQuery, totalRows }}
			showProgramFilter={false}
			hideProgramName
		/>
	);
};
