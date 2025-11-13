'use client';

import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
import { Button } from '@/app/portal/components/button';
import { makeCampaignColumns } from '@/app/portal/components/data-table/columns/campaigns';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { CampaignTableViewRow } from '@socialincome/shared/src/database/services/campaign/campaign.types';
import { logger } from '@socialincome/shared/src/utils/logger';
import { useState } from 'react';
import CampaignsForm from './campaigns-form';

export default function CampaignsTable({ rows, error }: { rows: CampaignTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
	const readOnly = rows.some((row) => row.permission === 'readonly');

	const openEmptyForm = () => {
		setCampaignId(undefined);
		setHasError(false);
		setOpen(true);
	};

	const openEditForm = (row: CampaignTableViewRow) => {
		setCampaignId(row.id);
		setHasError(false);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setHasError(true);
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
					{hasError && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>Error saving campaign</AlertDescription>
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
