'use client';

import { makeCampaignColumns } from '@/app/portal/components/custom/data-table/campaigns/campaigns-columns';
import { DataTable } from '@/app/portal/components/custom/data-table/data-table';
import { CampaignTableViewRow } from '@socialincome/shared/src/database/services/campaign/campaign.types';

type CampaignsTableProps = {
	data: CampaignTableViewRow[];
};

export default function CampaignsTable({ data }: CampaignsTableProps) {
	const columns = makeCampaignColumns();
	return <DataTable data={data} columns={columns} />;
}
