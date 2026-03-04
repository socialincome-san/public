'use client';

import { makeMobileMoneyProviderColumns } from '@/components/data-table/columns/mobile-money-providers';
import DataTable from '@/components/data-table/data-table';
import type { MobileMoneyProviderTableViewRow } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { MobileMoneyProviderDialog } from './mobile-money-provider-dialog';

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

	return (
		<>
			<DataTable
				title="Mobile Money Providers"
				error={error}
				emptyMessage="No mobile money providers found"
				data={rows}
				makeColumns={makeMobileMoneyProviderColumns}
				actionMenuItems={[
					{
						label: 'Add provider',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<MobileMoneyProviderDialog
				open={open}
				onOpenChange={setOpen}
				providerId={providerId}
				errorMessage={errorMessage}
				onError={setErrorMessage}
			/>
		</>
	);
}
