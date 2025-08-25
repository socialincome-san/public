import { Button } from '@/app/portal/components/button';
import { makeCampaignColumns } from '@/app/portal/components/data-table/columns/campaigns';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { CampaignService } from '@socialincome/shared/src/database/services/campaign/campaign.service';
import type { CampaignTableViewRow } from '@socialincome/shared/src/database/services/campaign/campaign.types';

export default async function CampaignsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new CampaignService();
	const result = await service.getCampaignTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: CampaignTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Campaigns"
			error={error}
			emptyMessage="No campaigns found"
			data={rows}
			makeColumns={makeCampaignColumns}
			actions={<Button>Add new campaign</Button>}
		/>
	);
}
