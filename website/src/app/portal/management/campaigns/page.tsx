import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { CampaignTableViewRow } from '@/lib/services/campaign/campaign.types';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';
import CampaignsTable from './campaigns-table';

export default function CampaignsPage() {
	return (
		<Suspense>
			<CampaignsDataLoader />
		</Suspense>
	);
}

const CampaignsDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();

	const campaignsResult = await services.campaign.getTableView(user.id);

	const error = campaignsResult.success ? null : campaignsResult.error;
	const campaignRows: CampaignTableViewRow[] = campaignsResult.success ? campaignsResult.data.tableRows : [];

	return <CampaignsTable rows={campaignRows} error={error} />;
};
