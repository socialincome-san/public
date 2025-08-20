import CampaignsTable from '@/app/portal/components/custom/data-table/campaigns/campaigns-table';
import TableWrapper from '@/app/portal/components/custom/data-table/elements/table-wrapper';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { CampaignService } from '@socialincome/shared/src/database/services/campaign/campaign.service';

export default async function CampaignsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new CampaignService();
	const result = await service.getCampaignTableViewForUser(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<TableWrapper title="Campaigns" error={error} isEmpty={!rows.length} emptyMessage="No campaigns found">
			<CampaignsTable data={rows} />
		</TableWrapper>
	);
}
