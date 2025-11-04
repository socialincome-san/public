import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { CampaignService } from '@socialincome/shared/src/database/services/campaign/campaign.service';
import type { CampaignTableViewRow } from '@socialincome/shared/src/database/services/campaign/campaign.types';
import CampaignsTable from './campaigns-table';

export default async function CampaignsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const campaignService = new CampaignService();
	const campaignsResult = await campaignService.getTableView(user.id);

	const error = campaignsResult.success ? null : campaignsResult.error;
	const campaignRows: CampaignTableViewRow[] = campaignsResult.success ? campaignsResult.data.tableRows : [];

	return <CampaignsTable rows={campaignRows} error={error} />;
}
