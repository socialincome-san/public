import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { MessageTemplateTableViewRow } from '@/lib/services/messaging/message-template.types';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import MessageTemplatesTableClient from './message-templates-table-client';

export default function MessageTemplatesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessageTemplatesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const MessageTemplatesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.messageTemplate.getPaginatedTableView(tableQuery);

	const error = result.success ? null : result.error;
	const templateRows: MessageTemplateTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <MessageTemplatesTableClient rows={templateRows} error={error} query={{ ...tableQuery, totalRows }} />;
};
