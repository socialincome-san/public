'use client';

import { Button } from '@/app/portal/components/button';
import { makeLocalPartnerColumns } from '@/app/portal/components/data-table/columns/local-partners';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import type { LocalPartnerTableViewRow } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { useState } from 'react';
import LocalPartnersForm from './local-partners-form';

export default function LocalPartnersTable({
	rows,
	error,
}: {
	rows: LocalPartnerTableViewRow[];
	error: string | null;
}) {
	const [open, setOpen] = useState(false);
	const [partnerId, setPartnerId] = useState<string | undefined>(undefined);

	return (
		<>
			<DataTable
				title="Local Partners"
				error={error}
				emptyMessage="No local partners found"
				data={rows}
				makeColumns={makeLocalPartnerColumns}
				actions={
					<Button
						onClick={() => {
							setPartnerId(undefined);
							setOpen(true);
						}}
					>
						Add new local partner
					</Button>
				}
				onRowClick={(row: LocalPartnerTableViewRow) => {
					setPartnerId(row.id);
					setOpen(true);
				}}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-[425]">
					<DialogHeader>
						<DialogTitle>Add local partner</DialogTitle>
					</DialogHeader>

					<LocalPartnersForm
						localPartnerId={partnerId}
						onSuccess={() => setOpen(false)}
						onError={() => alert('error')}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
