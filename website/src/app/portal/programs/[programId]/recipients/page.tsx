import type { SearchParamsPageProps } from '@/app/page-props';
import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { ProgramPermission } from '@/generated/prisma/enums';
import { getPaginatedRecipientTableViewByProgramId } from '@/modules/recipients/recipient.service';
import type { RecipientTableViewRow } from '@/modules/recipients/recipient.types';
import { requireSession } from '@/server/session';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { Suspense } from 'react';

type Props = SearchParamsPageProps & { params: Promise<{ programId: string }> };

const RecipientsPageProgramScoped = ({ params, searchParams }: Props) => {
	return (
		<BlockWrapper marginTop="none" marginBottom="none">
			<Card>
				<Suspense fallback={<AppLoadingSkeleton />}>
					<RecipientsProgramScopedDataLoader params={params} searchParams={searchParams} />
				</Suspense>
			</Card>
		</BlockWrapper>
	);
};

export default RecipientsPageProgramScoped;

const RecipientsProgramScopedDataLoader = async ({ params, searchParams }: Props) => {
	const { programId } = await params;
	const resolvedSearchParams = await searchParams;
	const baseQuery = tableQueryFromSearchParams(resolvedSearchParams);
	const tableQuery = { ...baseQuery, programId };
	const user = await requireSession('user');

	const recipientsResult = await getPaginatedRecipientTableViewByProgramId(user.id, programId, tableQuery);

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
