'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { campaignsTableConfig } from '@/components/data-table/configs/campaigns-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { CampaignTableViewRow } from '@/modules/campaigns/campaign.types';
import { useState } from 'react';
import { CampaignDialog } from './campaign-dialog';

export default function CampaignsTable({
	rows,
	error,
	query,
}: {
	rows: CampaignTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const [selectedCampaign, setSelectedCampaign] = useState<CampaignTableViewRow>();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const openCampaign = (row: CampaignTableViewRow) => {
		setSelectedCampaign(row);
		setIsDialogOpen(true);
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={campaignsTableConfig}
				titleInfoTooltip="Shows campaigns belonging to your active organization."
				rows={rows}
				error={error}
				query={query}
				onRowClick={openCampaign}
			/>

			{selectedCampaign && <CampaignDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} campaign={selectedCampaign} />}
		</>
	);
}
