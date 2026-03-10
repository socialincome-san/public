import { makeCampaignColumns } from '@/components/data-table/columns/campaigns';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { CampaignTableViewRow } from '@/lib/services/campaign/campaign.types';

export const campaignsTableConfig: DataTableConfig<CampaignTableViewRow> = {
	id: 'campaigns',
	title: 'Campaigns',
	emptyMessage: 'No campaigns found',
	searchKeys: ['id', 'title', 'description', 'programName', 'link'],
	sortOptions: [
		{ id: 'title', label: 'Title' },
		{ id: 'description', label: 'Description' },
		{ id: 'currency', label: 'Currency' },
		{ id: 'endDate', label: 'End date' },
		{ id: 'isActive', label: 'Status' },
		{ id: 'programName', label: 'Program' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeCampaignColumns,
	showColumnVisibilitySelector: true,
};
