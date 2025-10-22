'use client';

import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
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
	const [showError, setShowError] = useState(false);
	const [partnerId, setPartnerId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setPartnerId(undefined);
		setOpen(true);
	};

	const openEditForm = (row: LocalPartnerTableViewRow) => {
		setPartnerId(row.id);
		setOpen(true);
	};

	return (
		<>
			<DataTable
				title="Local Partners"
				error={error}
				emptyMessage="No local partners found"
				data={rows}
				makeColumns={makeLocalPartnerColumns}
				actions={<Button onClick={openEmptyForm}>Add new local partner</Button>}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425]">
					<DialogHeader>
						<DialogTitle>Add local partner</DialogTitle>
					</DialogHeader>
					{showError && (
						// TODO: add proper error handling
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>Error saving local partner</AlertDescription>
						</Alert>
					)}
					<LocalPartnersForm
						localPartnerId={partnerId}
						onSuccess={() => setOpen(false)}
						onError={() => setShowError(true)}
						onCancel={() => setOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
