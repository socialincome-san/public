'use client';

import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
import { Button } from '@/app/portal/components/button';
import { makePayoutColumns } from '@/app/portal/components/data-table/columns/payouts';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import type { PayoutTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import { useState } from 'react';
import { PayoutForm } from './payout-form';
import { StartPayoutProcessDialog } from './start-payout-process-dialog';

export function PayoutsTableClient({ rows, error }: { rows: PayoutTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [payoutId, setPayoutId] = useState<string | undefined>(undefined);
	const [isStartProcessOpen, setIsStartProcessOpen] = useState(false);

	const openEmptyForm = () => {
		setPayoutId(undefined);
		setHasError(false);
		setOpen(true);
	};

	const openEditForm = (row: PayoutTableViewRow) => {
		if (row.permission !== 'edit') {
			return;
		}
		setPayoutId(row.id);
		setHasError(false);
		setOpen(true);
	};

	const onError = (e?: unknown) => {
		setHasError(true);
		console.error('Payout Form Error:', e);
	};

	return (
		<>
			<DataTable
				title="Payouts"
				error={error}
				emptyMessage="No payouts found"
				data={rows}
				makeColumns={makePayoutColumns}
				actions={
					<div className="flex gap-2">
						<Button onClick={openEmptyForm}>Add payout</Button>
						<Button onClick={() => setIsStartProcessOpen(true)}>Start payout process</Button>
					</div>
				}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>{payoutId ? 'Edit' : 'Add'} payout</DialogTitle>
					</DialogHeader>

					{hasError && (
						<Alert variant="destructive" className="mb-3">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>Error saving payout</AlertDescription>
						</Alert>
					)}

					<PayoutForm
						payoutId={payoutId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>

			<StartPayoutProcessDialog open={isStartProcessOpen} setOpen={setIsStartProcessOpen} />
		</>
	);
}
