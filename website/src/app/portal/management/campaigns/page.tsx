import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { defaultLanguage } from '@/lib/i18n/utils';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { getCampaignTableEntries } from '@/modules/campaigns/campaign.service';
import type { CampaignTableViewRow } from '@/modules/campaigns/campaign.types';
import { getCampaigns, getPrograms } from '@/modules/storyblok-content/storyblok-content.service';
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

	const [campaignsResult, campaignStoriesResult, programsResult] = await Promise.all([
		getCampaignTableEntries(user.id),
		getCampaigns(defaultLanguage),
		getPrograms(defaultLanguage),
	]);
	const campaignStories = campaignStoriesResult.success ? campaignStoriesResult.data : [];
	const programStories = programsResult.success ? programsResult.data : [];
	const campaignTableView = campaignsResult.success
		? getCampaignTableView(campaignsResult.data, campaignStories, programStories, tableQuery)
		: { tableRows: [], totalCount: 0 };
	const error = campaignsResult.success ? null : campaignsResult.error;
	const campaignRows: CampaignTableViewRow[] = campaignTableView.tableRows;
	const totalRows = campaignTableView.totalCount;

	return <CampaignsTable rows={campaignRows} error={error} query={{ ...tableQuery, totalRows }} />;
};
