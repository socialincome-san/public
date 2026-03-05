import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { CampaignReadService } from '@/lib/services/campaign/campaign-read.service';
import type { CampaignTableViewRow } from '@/lib/services/campaign/campaign.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import CampaignsTable from './campaigns-table';

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

	const campaignService = new CampaignReadService();
	const campaignsResult = await campaignService.getPaginatedTableView(user.id, tableQuery);

	const error = campaignsResult.success ? null : campaignsResult.error;
	const campaignRows: CampaignTableViewRow[] = campaignsResult.success ? campaignsResult.data.tableRows : [];
	const totalRows = campaignsResult.success ? campaignsResult.data.totalCount : 0;

	return <CampaignsTable rows={campaignRows} error={error} query={{ ...tableQuery, totalRows }} />;
};
