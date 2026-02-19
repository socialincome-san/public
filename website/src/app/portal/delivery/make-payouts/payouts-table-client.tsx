'use client';

import { Button } from '@/components/button';
import { makePayoutColumns } from '@/components/data-table/columns/payouts';
import DataTable from '@/components/data-table/data-table';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { PayoutTableViewRow } from '@/lib/services/payout/payout.types';
import { CircleDollarSignIcon } from 'lucide-react';
import { useState } from 'react';
import { PayoutFormDialog } from './payout-form-dialog';
import { StartPayoutProcessDialog } from './start-payout-process-dialog';

export const PayoutsTableClient = ({ rows, error }: { rows: PayoutTableViewRow[]; error: string | null }) => {
	const [isPayoutFormOpen, setIsPayoutFormOpen] = useState(false);
	const [payoutId, setPayoutId] = useState<string | undefined>(undefined);
	const [readOnly, setReadOnly] = useState(false);
	const [isPayoutProcessDialogOpen, setIsPayoutProcessDialogOpen] = useState(false);

	const openEmptyForm = () => {
		setPayoutId(undefined);
		setReadOnly(false);
		setIsPayoutFormOpen(true);
	};

	const openEditForm = (row: PayoutTableViewRow) => {
		setPayoutId(row.id);
		setReadOnly(row.permission === ProgramPermission.owner);
		setIsPayoutFormOpen(true);
	};

	const handlePayoutFormClose = (open: boolean) => {
		setIsPayoutFormOpen(open);
		if (!open) {
			setPayoutId(undefined);
			setReadOnly(false);
		}
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
						<Button onClick={openEmptyForm}>Add manually</Button>

						<Button variant="outline" onClick={() => setIsPayoutProcessDialogOpen(true)}>
							Start payout process
							<CircleDollarSignIcon />
						</Button>
					</div>
				}
				onRowClick={openEditForm}
				searchKeys={['recipientFirstName', 'recipientLastName', 'programName']}
			/>

			<PayoutFormDialog
				open={isPayoutFormOpen}
				onOpenChange={handlePayoutFormClose}
				payoutId={payoutId}
				readOnly={readOnly}
			/>

			<StartPayoutProcessDialog open={isPayoutProcessDialogOpen} setOpen={setIsPayoutProcessDialogOpen} />
		</>
	);
};
