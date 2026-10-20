'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { mobileMoneyProvidersTableConfig } from '@/components/data-table/configs/mobile-money-providers-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { MobileMoneyProviderTableViewRow } from '@/modules/mobile-money-providers/mobile-money-provider.types';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
	const t = useTranslations('portal-admin');
	const { recordId: providerId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('providerId');

	return (
		<>
			<ConfiguredDataTableClient
				config={{
					...mobileMoneyProvidersTableConfig,
					title: t('table.providers'),
					emptyMessage: t('table.noProviders'),
				}}
				titleInfoTooltip={t('table.providersTooltip')}
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: t('actions.addProvider'),
						icon: <PlusIcon />,
						onSelect: openCreate,
					},
				]}
				onRowClick={(row) => openRecord(row.id)}
			/>

			{/* A child provider link reopens this dialog in place; the key resets its tabs and error for the new record */}
			<MobileMoneyProviderDialog key={providerId ?? 'new'} open={open} onOpenChange={onOpenChange} providerId={providerId} />
		</>
	);
}
