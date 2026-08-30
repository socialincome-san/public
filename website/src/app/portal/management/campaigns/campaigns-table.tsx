import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { campaignsTableConfig } from '@/components/data-table/configs/campaigns-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { CampaignTableViewRow } from '@/lib/services/campaign/campaign.types';

export default function CampaignsTable({
	rows,
	error,
	query,
}: {
	rows: CampaignTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	return (
		<ConfiguredDataTableClient
			config={campaignsTableConfig}
			titleInfoTooltip="Shows campaigns belonging to your active organization."
			rows={rows}
			error={error}
			query={query}
		/>
	);
}
