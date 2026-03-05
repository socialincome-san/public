'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { mobileMoneyProvidersTableConfig } from '@/components/data-table/configs/mobile-money-providers-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { MobileMoneyProviderTableViewRow } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { MobileMoneyProviderDialog } from './mobile-money-provider-dialog';

export default function MobileMoneyProvidersTable({
	rows,
	error,
	query,
}: {
	rows: MobileMoneyProviderTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
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
			<ConfiguredDataTableClient
				config={mobileMoneyProvidersTableConfig}
				rows={rows}
				error={error}
				query={query}
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
