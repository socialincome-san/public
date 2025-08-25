import { Button } from '@/app/portal/components/button';
import { makeCampaignColumns } from '@/app/portal/components/data-table/columns/campaigns';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { CampaignService } from '@socialincome/shared/src/database/services/campaign/campaign.service';
import type { CampaignTableViewRow } from '@socialincome/shared/src/database/services/campaign/campaign.types';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

type Props = { params: Promise<{ programId: string }> };

export default async function CampaignsPageProgramScoped({ params }: Props) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const campaignService = new CampaignService();
	const programService = new ProgramService();

	const [campaignsResult, programPermissionResult] = await Promise.all([
		campaignService.getCampaignTableViewProgramScoped(user.id, programId),
		programService.getProgramPermissionForUser(user.id, programId),
	]);

	const error = campaignsResult.success ? null : campaignsResult.error;
	const campaignRows: CampaignTableViewRow[] = campaignsResult.success ? campaignsResult.data.tableRows : [];
	const userIsOperator = programPermissionResult.success && programPermissionResult.data === 'operator';

	return (
		<DataTable
			title="Campaigns"
			error={error}
			emptyMessage="No campaigns found"
			data={campaignRows}
			makeColumns={makeCampaignColumns}
			actions={<Button disabled={!userIsOperator}>Add new campaign</Button>}
			hideProgramName
		/>
	);
}
