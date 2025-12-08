'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeLocalPartnerColumns } from '@/components/data-table/columns/local-partners';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { LocalPartnerTableViewRow } from '@/lib/services/local-partner/local-partner.types';
import { logger } from '@/lib/utils/logger';
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
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [partnerId, setPartnerId] = useState<string | undefined>(undefined);
	const openEmptyForm = () => {
		setPartnerId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: LocalPartnerTableViewRow) => {
		setPartnerId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setErrorMessage(`Error saving local partner: ${error}`);
		logger.error('Local Partner Form Error', { error });
	};

	return (
		<>
			<DataTable
				title="All Local Partners"
				error={error}
				emptyMessage="No local partners found"
				data={rows}
				makeColumns={makeLocalPartnerColumns}
				actions={<Button onClick={openEmptyForm}>Add new local partner</Button>}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{partnerId ? 'Edit' : 'Add'} local partner</DialogTitle>
					</DialogHeader>
					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					)}
					<LocalPartnersForm
						localPartnerId={partnerId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
