'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { campaignsTableConfig } from '@/components/data-table/configs/campaigns-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { CampaignTableViewRow } from '@/lib/services/campaign/campaign.types';
import { logger } from '@/lib/utils/logger';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import CampaignsForm from './campaigns-form';

export default function CampaignsTable({
	rows,
	error,
	query,
}: {
	rows: CampaignTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
	const readOnly = rows.some((row) => row.permission === 'readonly');

	const openEmptyForm = () => {
		setCampaignId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: CampaignTableViewRow) => {
		setCampaignId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setErrorMessage(`Error saving campaign: ${String(error)}`);
		logger.error('Campaigns Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={campaignsTableConfig}
				titleInfoTooltip="Shows campaigns belonging to your active organization."
				rows={rows}
				error={error}
				query={query}
				onRowClick={openEditForm}
				actionMenuItems={[
					{
						label: 'Add new campaign',
						icon: <PlusIcon />,
						disabled: readOnly,
						onSelect: openEmptyForm,
					},
				]}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{campaignId ? (readOnly ? 'View' : 'Edit') : 'Add'} Campaign</DialogTitle>
					</DialogHeader>
					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
						</Alert>
					)}
					<CampaignsForm
						campaignId={campaignId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
						readOnly={readOnly}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
