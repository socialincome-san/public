import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { CampaignService } from '@/lib/services/campaign/campaign.service';
import type { CampaignTableViewRow } from '@/lib/services/campaign/campaign.types';
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

  const campaignService = new CampaignService();
  const campaignsResult = await campaignService.getTableView(user.id);

  const error = campaignsResult.success ? null : campaignsResult.error;
  const campaignRows: CampaignTableViewRow[] = campaignsResult.success ? campaignsResult.data.tableRows : [];

  return <CampaignsTable rows={campaignRows} error={error} />;
};
