'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeMobileMoneyProviderColumns } from '@/components/data-table/columns/mobile-money-providers';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { MobileMoneyProviderTableViewRow } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import MobileMoneyProvidersForm from './mobile-money-providers-form';

export default function MobileMoneyProvidersTable({
	rows,
	error,
}: {
	rows: MobileMoneyProviderTableViewRow[];
	error: string | null;
}) {
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [providerId, setProviderId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setProviderId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: MobileMoneyProviderTableViewRow) => {
		setProviderId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		setErrorMessage(`Error saving mobile money provider: ${error}`);
		logger.error('Mobile Money Provider Form Error', { error });
	};

	return (
		<>
			<DataTable
				title="Mobile Money Providers"
				error={error}
				emptyMessage="No mobile money providers found"
				data={rows}
				makeColumns={makeMobileMoneyProviderColumns}
				actions={<Button onClick={openEmptyForm}>Add provider</Button>}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{providerId ? 'Edit' : 'Add'} mobile money provider</DialogTitle>
					</DialogHeader>
					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription className="max-w-full overflow-auto">
								{errorMessage}
							</AlertDescription>
						</Alert>
					)}
					<MobileMoneyProvidersForm
						providerId={providerId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
