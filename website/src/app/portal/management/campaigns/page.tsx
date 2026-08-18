import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { defaultLanguage } from '@/lib/i18n/utils';
import type { CampaignTableViewRow } from '@/lib/services/campaign/campaign.types';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import CampaignsTable from './campaigns-table';
import { getCampaignTableView } from './campaigns-table.server';

export default function CampaignsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<CampaignsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const CampaignsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const [campaignsResult, programsResult] = await Promise.all([
		services.read.campaign.getTableEntries(user.id),
		services.storyblok.getPrograms(defaultLanguage),
	]);
	const programStories = programsResult.success ? programsResult.data : [];
	const campaignTableView = campaignsResult.success
		? getCampaignTableView(campaignsResult.data, programStories, tableQuery)
		: { tableRows: [], totalCount: 0 };
	const error = campaignsResult.success ? null : campaignsResult.error;
	const campaignRows: CampaignTableViewRow[] = campaignTableView.tableRows;
	const totalRows = campaignTableView.totalCount;

	return <CampaignsTable rows={campaignRows} error={error} query={{ ...tableQuery, totalRows }} />;
};
