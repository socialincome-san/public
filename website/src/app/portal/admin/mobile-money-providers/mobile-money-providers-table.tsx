'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { mobileMoneyProvidersTableConfig } from '@/components/data-table/configs/mobile-money-providers-table.config';
import { useSearchParamState } from '@/components/data-table/hooks/use-search-param-state';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { MobileMoneyProviderTableViewRow } from '@/modules/mobile-money-providers/mobile-money-provider.types';
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
	const [providerId, setProviderId] = useSearchParamState('providerId');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const open = isCreateFormOpen || Boolean(providerId);

	const openEmptyForm = () => {
		setProviderId(undefined);
		setErrorMessage(null);
		setIsCreateFormOpen(true);
	};

	const openEditForm = (row: MobileMoneyProviderTableViewRow) => {
		setProviderId(row.id);
		setErrorMessage(null);
	};

	const onOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setProviderId(undefined);
			setIsCreateFormOpen(false);
		}
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={mobileMoneyProvidersTableConfig}
				titleInfoTooltip="Shows all configured mobile money providers."
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
				onOpenChange={onOpenChange}
				providerId={providerId}
				errorMessage={errorMessage}
				onError={setErrorMessage}
			/>
		</>
	);
}
