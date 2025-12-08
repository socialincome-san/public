'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeCampaignColumns } from '@/components/data-table/columns/campaigns';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { CampaignTableViewRow } from '@/lib/services/campaign/campaign.types';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import CampaignsForm from './campaigns-form';

export default function CampaignsTable({ rows, error }: { rows: CampaignTableViewRow[]; error: string | null }) {
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
		setErrorMessage(`Error saving campaign: ${error}`);
		logger.error('Campaigns Form Error', { error });
	};

	return (
		<>
			<DataTable
				title="Campaigns"
				error={error}
				emptyMessage="No campaigns found"
				data={rows}
				makeColumns={makeCampaignColumns}
				onRowClick={openEditForm}
				actions={
					<Button disabled={readOnly} onClick={openEmptyForm}>
						Add new campaign
					</Button>
				}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{campaignId ? (readOnly ? 'View' : 'Edit') : 'Add'} Campaign</DialogTitle>
					</DialogHeader>
					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
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
