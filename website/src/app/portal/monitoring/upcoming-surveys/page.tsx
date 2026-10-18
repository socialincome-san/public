import type { SearchParamsPageProps } from '@/app/page-props';
import { getPortalOperationsTranslations } from '@/app/portal/portal-operations-server-translations';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	getUpcomingSurveysTableFilters,
	upcomingSurveysTableConfig,
} from '@/components/data-table/configs/upcoming-surveys-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedUpcomingSurveyTableView } from '@/modules/surveys/survey.service';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';

export default function UpcomingSurveysPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<UpcomingSurveysDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const UpcomingSurveysDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireSession('user');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);
	const t = await getPortalOperationsTranslations();

	const result = await getPaginatedUpcomingSurveyTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];

	return (
		<ConfiguredDataTableClient
			config={upcomingSurveysTableConfig}
			titleInfoTooltip={t('monitoring.upcoming_surveys_info')}
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			toolbarFilters={getUpcomingSurveysTableFilters({
				query: { ...tableQuery, totalRows },
				programFilterOptions,
			})}
		/>
	);
};
