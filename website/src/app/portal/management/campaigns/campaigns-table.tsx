'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { campaignsTableConfig } from '@/components/data-table/configs/campaigns-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { CampaignTableViewRow } from '@/modules/campaigns/campaign.types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { translateManagementTableConfig } from '../management-table-config';
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
	const t = useTranslations('portal-management');
	const [selectedCampaign, setSelectedCampaign] = useState<CampaignTableViewRow>();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const config = translateManagementTableConfig(campaignsTableConfig, {
		title: t('tables.campaigns.title'),
		emptyMessage: t('tables.campaigns.empty'),
		columns: {
			title: t('columns.title'),
			currency: t('columns.currency'),
			endDate: t('columns.endDate'),
			isActive: t('columns.isActive'),
			programName: t('columns.programName'),
			createdAt: t('columns.createdAt'),
			link: t('columns.link'),
		},
	});

	const openCampaign = (row: CampaignTableViewRow) => {
		setSelectedCampaign(row);
		setIsDialogOpen(true);
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={config}
				titleInfoTooltip={t('tables.campaigns.tooltip')}
				rows={rows}
				error={error}
				query={query}
				onRowClick={openCampaign}
			/>

			{selectedCampaign && <CampaignDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} campaign={selectedCampaign} />}
		</>
	);
}
