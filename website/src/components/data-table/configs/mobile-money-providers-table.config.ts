import { makeMobileMoneyProviderColumns } from '@/components/data-table/columns/mobile-money-providers';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { MobileMoneyProviderTableViewRow } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';

export const mobileMoneyProvidersTableConfig: DataTableConfig<MobileMoneyProviderTableViewRow> = {
	id: 'admin-mobile-money-providers',
	title: 'Mobile Money Providers',
	emptyMessage: 'No mobile money providers found',
	searchKeys: ['name'],
	sortOptions: [
		{ id: 'name', label: 'Name' },
		{ id: 'isSupported', label: 'Supported' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeMobileMoneyProviderColumns,
	showColumnVisibilitySelector: true,
};
