import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { defaultLanguage } from '@/lib/i18n/utils';
import { getCampaignTableEntries } from '@/modules/campaigns/campaign.service';
import type { CampaignTableViewRow } from '@/modules/campaigns/campaign.types';
import { getCampaigns, getPrograms } from '@/modules/storyblok-content/storyblok-content.service';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
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
	const user = await requireSession('user');
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
